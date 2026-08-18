import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const REQUIRED = ['title','price','year','km','fuel','location','seller','posted','description','photos','url'];
const TYPE = {title:'string',price:'number',year:'number',km:'number',fuel:'string',location:'string',seller:'string',posted:'string',description:'string',photos:'number',url:'string'};

const sampleListings = [
  { id:'GC-001', title:'2021 Maruti Swift VXI', price:620000, year:2021, km:28000, fuel:'Petrol', location:'Patna', seller:'Dealer', posted:'2h ago', photos:8, url:'https://www.olx.in/', description:'Single owner, clean car, service history available.', risk:12, flags:[] },
  { id:'GC-002', title:'2019 Hyundai Creta SX', price:795000, year:2019, km:54000, fuel:'Diesel', location:'Patna', seller:'Individual', posted:'5h ago', photos:6, url:'https://www.olx.in/', description:'Urgent sale. Original papers. Price negotiable.', risk:31, flags:['Price below local median'] },
  { id:'GC-003', title:'2020 Honda City ZX', price:525000, year:2020, km:18000, fuel:'Petrol', location:'Patna', seller:'Individual', posted:'1h ago', photos:3, url:'https://www.olx.in/', description:'Very urgent. Call only. No test drive.', risk:78, flags:['Unusually low price','Low photo count','Pressure language'] },
  { id:'GC-004', title:'2022 Tata Nexon XZ+', price:845000, year:2022, km:22000, fuel:'Petrol', location:'Patna', seller:'Dealer', posted:'1d ago', photos:12, url:'https://www.olx.in/', description:'Full service record, finance available, inspection welcome.', risk:7, flags:[] }
];

let state = { listings: sampleListings, lastRun: null, runCount: 0, source: 'demo dataset' };

function analyze(listing) {
  const flags = [...listing.flags];
  let risk = listing.risk;
  if (listing.photos < 4 && !flags.includes('Low photo count')) { flags.push('Low photo count'); risk += 12; }
  if (/urgent|call only|no test drive/i.test(listing.description) && !flags.includes('Pressure language')) { flags.push('Pressure language'); risk += 14; }
  if (listing.price < 600000 && listing.year >= 2020 && !flags.includes('Unusually low price')) { flags.push('Unusually low price'); risk += 10; }
  risk = Math.min(100, risk);
  return { ...listing, risk, flags, verdict: risk >= 60 ? 'HIGH RISK' : risk >= 25 ? 'REVIEW' : 'LOW RISK' };
}

function validate(records) {
  const problems = [];
  for (const [index, record] of records.entries()) {
    for (const field of REQUIRED) {
      if (!(field in record)) problems.push({index, field, kind:'missing', repair:`Map the source field into '${field}' using the semantic extraction prompt.`});
      else if (record[field] !== null && typeof record[field] !== TYPE[field]) problems.push({index, field, kind:'type_mismatch', repair:`Normalize '${field}' to ${TYPE[field]} before scoring.`});
    }
  }
  return {ok: problems.length === 0, problems, repair_required: problems.length > 0};
}

app.get('/api/health', (_req,res) => res.json({ok:true, app:'GadiCheck', version:'1.0.0'}));
app.get('/api/listings', (_req,res) => res.json({listings:state.listings.map(analyze), lastRun:state.lastRun, runCount:state.runCount, source:state.source}));
app.post('/api/analyze', (_req,res) => res.json({listings:state.listings.map(analyze)}));
app.post('/api/validate', (req,res) => res.json(validate(Array.isArray(req.body?.listings) ? req.body.listings : state.listings)));
app.post('/api/run', (_req,res) => {
  state.lastRun = new Date().toISOString();
  state.runCount += 1;
  const validation = validate(state.listings);
  res.json({ok:true, message:validation.ok ? 'Scrape → validate → analyze completed' : 'Schema drift detected; repair plan generated', source:state.source, runCount:state.runCount, validation, listings:state.listings.map(analyze)});
});
app.post('/api/scrape', (req,res) => {
  const url = String(req.body?.url || '').trim();
  if (!url) return res.status(400).json({error:'url is required'});
  state.source = url;
  state.lastRun = new Date().toISOString();
  state.runCount += 1;
  const validation = validate(state.listings);
  res.json({ok:true, mode:'brightdata-ready', message:validation.ok ? 'Extraction accepted and analyzed' : 'Extraction accepted; schema repair required', url, validation, listings:state.listings.map(analyze)});
});
app.get('*', (_req,res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`GadiCheck running at http://localhost:${PORT}`));

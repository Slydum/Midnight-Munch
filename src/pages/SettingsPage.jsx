import {useRef,useState} from 'react';
import HouseholdSetup from './HouseholdSetup.jsx';
import {db} from '../lib/supabase.js';
export default function SettingsPage({settings,onSave}){
 const fileRef=useRef(null);const [message,setMessage]=useState(''),[error,setError]=useState('');
 const exportBackup=()=>{const blob=new Blob([JSON.stringify(db.exportAll(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`midnight-munch-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);setMessage('Backup file created. Keep it somewhere safe.');setError('');};
 const importBackup=async e=>{const file=e.target.files?.[0];if(!file)return;setMessage('');setError('');try{const data=JSON.parse(await file.text());if(!window.confirm('Restore this backup? Existing local recipes, plans and settings will be replaced. Export a backup first if you want a copy of the current data.'))return;db.importAll(data);setMessage('Backup restored. Reloading your kitchen…');window.setTimeout(()=>window.location.reload(),500);}catch(err){setError(err.message||'Could not read this backup file.');}finally{e.target.value='';}};
 return <section className="settings-page"><div className="settings-heading"><p className="eyebrow">YOUR KITCHEN, YOUR SETTINGS</p><h1>Household <em>preferences.</em></h1><p>Update your profile or protect the recipes and plans saved on this device.</p></div>
  <HouseholdSetup settings={settings} onSave={onSave} editing/>
  <section className="backup-panel"><span className="setup-step">LOCAL DATA</span><h2>Backup & restore</h2><p>Your data lives in this browser on this device. A browser reset, cleared website data, or lost device can erase it. Make a backup regularly.</p>
   <div className="backup-actions"><button className="setup-submit" type="button" onClick={exportBackup}>Export backup ↓</button><button className="backup-secondary" type="button" onClick={()=>fileRef.current?.click()}>Restore from file ↑</button><input ref={fileRef} type="file" accept="application/json,.json" onChange={importBackup} hidden/></div>
   {message&&<p className="backup-message" role="status">{message}</p>}{error&&<p className="backup-error" role="alert">{error}</p>}
   <div className="local-note"><strong>Local-first by design</strong><span>Household access: this device only</span><span>Price mode: editable estimates in PHP</span><span>Cloud accounts and cross-device sync are disabled</span></div>
  </section>
 </section>;
}
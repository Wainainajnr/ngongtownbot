export default function TestEnv() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Test</h1>
      <p>HUGGINGFACE_MODEL: {process.env.NEXT_PUBLIC_HUGGINGFACE_MODEL || 'Not set'}</p>
      <p>HUGGINGFACE_API_KEY: {process.env.HUGGINGFACE_API_KEY ? '*** Set ***' : 'Not set'}</p>
      <p>API Key starts with hf_: {process.env.HUGGINGFACE_API_KEY?.startsWith('hf_') ? 'Yes' : 'No'}</p>
    </div>
  );
}
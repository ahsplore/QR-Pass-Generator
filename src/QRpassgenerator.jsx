import { useState, useEffect } from 'react';
import * as QRCode from 'qrcode.react';
import { toPng } from 'html-to-image';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';


const QRPassGenerator = () => {
  const [userId, setUserId] = useState('');
  const [passName, setPassName] = useState('');
  const [userPasses, setUserPasses] = useState([]);
  const [generatedPass, setGeneratedPass] = useState(null);
  const [error, setError] = useState('');

  const savePass = async (pass) => {
    try {
      const response = await fetch('https://qr-pass-generator-2sos.onrender.com/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pass)
      });
      if (!response.ok) throw new Error('Failed to save pass');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getPasses = async (userId) => {
    try {
      const response = await fetch(`https://qr-pass-generator-2sos.onrender.com/api/qr/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch passes');
      return await response.json();
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  const handleGenerate = async () => {
    if (!userId || !passName) {
      setError('Please enter both User ID and Pass Name');
      return;
    }

    try {
      const newPass = {
        userId,
        passName,
        id: Math.random().toString(36).slice(2),
        generatedAt: new Date().toISOString()
      };

      setGeneratedPass(newPass);
      await savePass(newPass);
      setUserPasses(await getPasses(userId));
      setError('');
    } catch (err) {
      console.error('Error generating pass:', err);
    }
  };

  const handleDownload = () => {
    const element = document.getElementById('pass-container');
    toPng(element)
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${passName}_${userId}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        setError('Failed to generate pass image');
        console.error(err);
      });
  };

  useEffect(() => {
    if (userId) {
      getPasses(userId).then(passes => setUserPasses(passes));
    }
  }, [userId]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="text-center mb-5">
            <h1 className="display-4">QR Pass Generator</h1>
            <p className="lead">Create and manage your event passes</p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="card shadow-sm mb-5">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Create New Pass</h2>
              
              <div className="mb-3">
                <label htmlFor="userId" className="form-label">User ID</label>
                <input
                  type="text"
                  className="form-control"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="passName" className="form-label">Pass Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="passName"
                  value={passName}
                  onChange={(e) => setPassName(e.target.value)}
                />
              </div>
              
              <button 
                className="btn btn-primary w-100 py-2"
                onClick={handleGenerate}
              >
                Generate Pass
              </button>
            </div>
          </div>

          {generatedPass && (
            <div className="mb-5">
              <div className="text-center mb-4">
                <h2>Your Pass</h2>
              </div>
              
              <div id="pass-container" className="pass-container mx-auto">
                <div className="pass-header text-center">
                  <h3 className="pass-title">{generatedPass.passName}</h3>
                  <p className="pass-id">ID: {generatedPass.userId}</p>
                </div>
                
                <div className="pass-qr-container">
                  <QRCode.QRCodeCanvas 
                    value={generatedPass.userId}
                    size={150}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <div className="pass-footer text-center">
                  <p className="pass-date">
                    Generated: {new Date(generatedPass.generatedAt).toLocaleDateString()}
                  </p>
                  <p className="scan-text">Scan QR code for verification</p>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <button 
                  className="btn btn-success px-4"
                  onClick={handleDownload}
                >
                  Download Pass
                </button>
              </div>
            </div>
          )}

          {userPasses.length > 0 && (
            <div className="mt-5">
              <h2 className="text-center mb-4">Your Previous Passes</h2>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {userPasses.map(pass => (
                  <div key={pass.id} className="col">
                    <div className="card h-100 pass-card">
                      <div className="card-body text-center">
                        <h4 className="card-title">{pass.passName}</h4>
                        <p className="card-text pass-id">ID: {pass.userId}</p>
                        <div className="pass-qr-small">
                          <QRCode.QRCodeCanvas 
                            value={pass.userId}
                            size={100}
                            level="H"
                          />
                        </div>
                        <p className="pass-date">
                          {new Date(pass.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRPassGenerator;

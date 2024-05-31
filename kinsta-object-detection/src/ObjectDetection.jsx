import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

const ObjectDetection = () => {
  const videoRef = useRef(null);
  const [isWebcamStarted, setIsWebcamStarted] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [detectionInterval, setDetectionInterval] = useState();

  const startWebcam = async () => {
    try {
        setIsWebcamStarted(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        setIsWebcamStarted(false);
        console.error('Error accessing webcam:', error);
      }
  };

  const predictObject = async () => {
    const model = await cocoSsd.load();
    model.detect(videoRef.current).then((predictions) => {
      setPredictions(predictions);
    }).catch(err => {
        console.error(err);
    });
  };

  useEffect(() => {
    if (isWebcamStarted) {
      setDetectionInterval(setInterval(predictObject, 500));
    } else {
      if (detectionInterval) {
        clearInterval(detectionInterval);
        setDetectionInterval(null);
      }
    }
  }, [isWebcamStarted]);

  const stopWebcam = () => {
    const video = videoRef.current;

    if (video && video.srcObject) {
      const stream = video.srcObject;
      const tracks = stream.getTracks();
  
      tracks.forEach((track) => {
        track.stop();
      });
  
      video.srcObject = null;
      setIsWebcamStarted(false); 
    }
  };

  const handleMarkerClick = (objectName) => {
    const query = encodeURIComponent(objectName);
    window.open(`https://www.amazon.com/s?k=${query}`, '_blank');
  };

  return (
    <div className="object-detection">
      <div className="buttons">
        <button onClick={isWebcamStarted ? stopWebcam : startWebcam}>{isWebcamStarted ? "Stop" : "Start"} Webcam</button>
      </div>
      <div className="feed">
        {isWebcamStarted ? <video ref={videoRef} autoPlay muted /> : <div />}
        {predictions.map((prediction, index) => (
          <div key={index}>
            <p style={{
              left: `${prediction.bbox[0]}px`, 
              top: `${prediction.bbox[1]}px`,
              width: `${prediction.bbox[2] - 100}px`
            }}>{prediction.class + ' - with ' 
            + Math.round(parseFloat(prediction.score) * 100) 
            + '% confidence.'}</p>
            <div className={"marker"} style={{
              left: `${prediction.bbox[0]}px`,
              top: `${prediction.bbox[1]}px`,
              width: `${prediction.bbox[2]}px`,
              height: `${prediction.bbox[3]}px`
            }} onClick={() => handleMarkerClick(prediction.class)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ObjectDetection;

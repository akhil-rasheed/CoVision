import { MutableRefObject, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { getValidTestArea, TestArea } from './getValidTestArea';
import runClassifierAnalysis, { TestResult } from './runClassifierAnalysis';
import runYolov5Analysis from './runYolov5Analysis';
import { BarcodeScanResult, runBarcodeScan } from './runBarcodeScan';
import { CameraPreview, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const useEvery = (ms: number, callback: () => Promise<void>) => {
  useEffect(() => {
    let isActive = true;
    const addTimeout = () => {
      setTimeout(async () => {
        try {
          await Promise.any([sleep(5000), callback()]);
        } finally {
          if (isActive) addTimeout();
        }
      }, ms);
    };
    addTimeout();
    return () => {
      isActive = false;
    };
  }, [ms, callback]);
};

type AnalysisResult = {
  result: TestResult;
  detectionScore: number;
  area?: TestArea['area'];
  barcodeResult?: BarcodeScanResult;
};

const usePipeline = (cameraPreviewRef: MutableRefObject<typeof CameraPreview | null>) => {
  const [lastResult, setLastResult] = useState<AnalysisResult>({ result: TestResult.Pending, detectionScore: -1 });
  useEvery(
    1000,
    useCallback(async () => {
      if (!cameraPreviewRef.current) return;
      let result = TestResult.Pending;
      let detectionScore = -1;
      let area;
      const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
        width: 640,
        height: 640,
      };
      const screenshotRaw = await cameraPreviewRef.current.capture(cameraPreviewPictureOptions);
      const screenshot = screenshotRaw.value;
      const barcodeTask = screenshot ? runBarcodeScan(screenshot) : undefined;

      const yolov5Res = await runYolov5Analysis(cameraPreviewRef.current);
      const testArea = getValidTestArea(yolov5Res);
      console.log(testArea);

      if (!testArea.input_tf || !testArea.area) {
        result = TestResult.NotFound;
      } else {
        result = await runClassifierAnalysis(testArea);
        detectionScore = testArea.score;
        area = testArea.area;
      }

      yolov5Res.input_tf?.dispose();

      const barcodeResult = await barcodeTask;

      setLastResult({
        result,
        detectionScore,
        area,
        barcodeResult,
      });
    }, [cameraPreviewRef])
  );
  return lastResult;
};

export default usePipeline;

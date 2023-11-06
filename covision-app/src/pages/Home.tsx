import React from 'react';
import { IonButton, IonCard, IonCardContent, IonContent, IonPage, IonText } from '@ionic/react';
import { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import CovCamera from '../components/CovCamera';
import { TestResult } from '../api/runClassifierAnalysis';
import showWelcomeText from '../api/showWelcomeText';
import usePipeline from '../api/usePipeline';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';

const cameraPreviewOptions: CameraPreviewOptions = {
  parent: 'cameraPreview',
  toBack: true,
};
CameraPreview.start(cameraPreviewOptions);

showWelcomeText();

const Home: React.FC = () => {
  const { t } = useTranslation();
  const cameraPreviewRef = useRef<typeof CameraPreview | null>(null);
  cameraPreviewRef.current = CameraPreview;
  const { result, detectionScore, area } = usePipeline(cameraPreviewRef) ?? {};
  const history = useHistory();

  useEffect(() => {}, [history, t]);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            paddingTop: 'env(safe-area-inset-top)',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            background: 'linear-gradient(0deg, rgba(24,24,24,0) 0%, rgba(24,24,24,1) 100%)',
          }}
        >
          <img aria-hidden="true" style={{ height: 80 }} src="/assets/logo.png" alt="CoVision" />
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            padding: '10px',
          }}
        >
          <IonButton style={{ width: '150px', fontSize: '14px', zIndex: '1' }} href="/privacyPolicy">
            {t('privacypolicy')}
          </IonButton>
          <IonButton style={{ width: '150px', fontSize: '14px', zIndex: '1' }} href="/imprint">
            {t('imprint')}
          </IonButton>
          <IonButton style={{ width: '150px', fontSize: '14px', zIndex: '1' }} href="/info">
            {t('info')}
          </IonButton>
        </div>
        {/* Test result info box */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <IonCard>
            <IonCardContent>
              <IonText style={{ color: '#fff' }}>
                <h2 role="alert">
                  {detectionScore !== -1
                    ? t('testDetected') + t(TestResult[result]) + '.               '
                    : t('pleaseScan')}
                </h2>
                {false && ( // debug info
                  <h2>
                    {detectionScore !== -1 ? 1 : 0} tests detected (highest score: {detectionScore}), result:{' '}
                    {TestResult[result]}
                  </h2>
                )}
              </IonText>
            </IonCardContent>
          </IonCard>
        </div>
        {/* Bounding box */}
        {area && (
          <div
            style={{
              position: 'absolute',
              borderWidth: 4,
              borderColor: 'red',
              borderStyle: 'solid',
              borderRadius: 8,
              zIndex: 200,
              top: area.top * 100 + '%',
              bottom: (1 - area.bottom) * 100 + '%',
              left: area.left * 100 + '%',
              right: (1 - area.right) * 100 + '%',
            }}
          ></div>
        )}
      </IonContent>
      <div
        id="cameraPreview"
        style={{
          position: 'fixed',
          height: '100%',
          width: '100%',
          margin: 'auto',
        }}
      ></div>
    </IonPage>
  );
};

export default Home;

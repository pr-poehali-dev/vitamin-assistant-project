import { useState } from 'react';
import SurveyStepOne, { StepOneData } from '@/components/SurveyStepOne';
import SurveyStepTwo from '@/components/SurveyStepTwo';
import { getSurveyUrl } from '@/config/api';

interface SurveyPageProps {
  onComplete: (userId: number, surveyId: number) => void;
}

export default function SurveyPage({ onComplete }: SurveyPageProps) {
  const [step, setStep] = useState(1);
  const [stepOneData, setStepOneData] = useState<StepOneData | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [surveyId, setSurveyId] = useState<number | null>(null);

  const handleStepOneComplete = async (data: StepOneData) => {
    try {
      const response = await fetch(getSurveyUrl('register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setUserId(result.user_id);
        setSurveyId(result.survey_id);
        setStepOneData(data);
        setStep(2);
      } else {
        alert('Ошибка при регистрации. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Ошибка подключения. Проверьте интернет и попробуйте снова.');
    }
  };

  const handleStepTwoComplete = async (answers: Record<number, any>) => {
    if (!surveyId) return;

    try {
      const response = await fetch(getSurveyUrl('submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_id: surveyId,
          answers
        })
      });

      if (response.ok && userId && surveyId) {
        onComplete(userId, surveyId);
      } else {
        alert('Ошибка при сохранении анкеты. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка подключения. Проверьте интернет и попробуйте снова.');
    }
  };

  const handleBackToStepOne = () => {
    setStep(1);
  };

  return (
    <>
      {step === 1 && (
        <SurveyStepOne onComplete={handleStepOneComplete} />
      )}
      {step === 2 && stepOneData && (
        <SurveyStepTwo
          stepOneData={stepOneData}
          onComplete={handleStepTwoComplete}
          onBack={handleBackToStepOne}
        />
      )}
    </>
  );
}
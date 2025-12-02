import { useState } from 'react';
import Hero from '@/components/Hero';
import Benefits from '@/components/Benefits';
import Survey from '@/components/Survey';
import Results from '@/components/Results';
import Catalog from '@/components/Catalog';

export type SurveyData = {
  goals: string[];
  diet: string;
  allergies: string[];
  foodCategories: string[];
  activity: string;
  gender: string;
  healthIssues: string[];
  habits: string[];
  workType: string;
};

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'survey' | 'results' | 'catalog'>('home');
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);

  const handleStartSurvey = () => {
    setCurrentView('survey');
  };

  const handleSurveyComplete = (data: SurveyData) => {
    setSurveyData(data);
    setCurrentView('results');
  };

  const handleViewCatalog = () => {
    setCurrentView('catalog');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSurveyData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-secondary/20 to-muted/30">
      {currentView === 'home' && (
        <>
          <Hero onStartSurvey={handleStartSurvey} onViewCatalog={handleViewCatalog} />
          <Benefits />
        </>
      )}
      
      {currentView === 'survey' && (
        <Survey onComplete={handleSurveyComplete} onBack={handleBackToHome} />
      )}
      
      {currentView === 'results' && surveyData && (
        <Results data={surveyData} onViewCatalog={handleViewCatalog} onBack={handleBackToHome} />
      )}
      
      {currentView === 'catalog' && (
        <Catalog onBack={handleBackToHome} />
      )}
    </div>
  );
};

export default Index;
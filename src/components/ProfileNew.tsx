import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import SurveyStepTwo from '@/components/SurveyStepTwo';
import SurveyStepThree from '@/components/SurveyStepThree';
import PersonalRecommendations from '@/components/PersonalRecommendations';
import { getSurveyUrl } from '@/config/api';

interface ProfileNewProps {
  userId: number;
  surveyId: number;
  onBack: () => void;
}

interface SurveyStatus {
  stage1_completed: boolean;
  stage2_completed: boolean;
  stage3_completed: boolean;
  user_name: string;
  user_email: string;
}

export default function ProfileNew({ userId, surveyId, onBack }: ProfileNewProps) {
  const [surveyStatus, setSurveyStatus] = useState<SurveyStatus | null>(null);
  const [currentStage, setCurrentStage] = useState<'dashboard' | 'stage2' | 'stage3' | 'recommendations'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurveyStatus();
  }, [userId, surveyId]);

  const loadSurveyStatus = async () => {
    try {
      const response = await fetch(getSurveyUrl('status') + `?survey_id=${surveyId}`);
      if (response.ok) {
        const data = await response.json();
        setSurveyStatus(data);
      }
    } catch (error) {
      console.error('Error loading survey status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStage2Complete = async (answers: Record<number, any>) => {
    try {
      const response = await fetch(getSurveyUrl('submit-stage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_id: surveyId,
          stage: 2,
          answers
        })
      });

      if (response.ok) {
        await loadSurveyStatus();
        setCurrentStage('dashboard');
      } else {
        alert('Ошибка при сохранении анкеты. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка подключения. Проверьте интернет и попробуйте снова.');
    }
  };

  const handleStage3Complete = async (answers: Record<number, any>) => {
    try {
      const response = await fetch(getSurveyUrl('submit-stage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_id: surveyId,
          stage: 3,
          answers
        })
      });

      if (response.ok) {
        await loadSurveyStatus();
        setCurrentStage('dashboard');
      } else {
        alert('Ошибка при сохранении анкеты. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка подключения. Проверьте интернет и попробуйте снова.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (currentStage === 'stage2') {
    return (
      <SurveyStepTwo
        stepOneData={{ name: '', email: '', gender: '', birthDate: '', goals: [] }}
        onComplete={handleStage2Complete}
        onBack={() => setCurrentStage('dashboard')}
      />
    );
  }

  if (currentStage === 'stage3') {
    return (
      <SurveyStepThree
        onComplete={handleStage3Complete}
        onBack={() => setCurrentStage('dashboard')}
      />
    );
  }

  if (currentStage === 'recommendations') {
    return (
      <PersonalRecommendations
        userId={userId}
        surveyId={surveyId}
        onBack={() => setCurrentStage('dashboard')}
      />
    );
  }

  const totalProgress = 
    (surveyStatus?.stage1_completed ? 33 : 0) +
    (surveyStatus?.stage2_completed ? 33 : 0) +
    (surveyStatus?.stage3_completed ? 34 : 0);

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="rounded-full">
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Личный кабинет</h1>
              <p className="text-muted-foreground mt-1">
                {surveyStatus?.user_name} • {surveyStatus?.user_email}
              </p>
            </div>
          </div>
        </div>

        {/* Прогресс заполнения */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={24} className="text-primary" />
              Прогресс заполнения анкет
            </CardTitle>
            <CardDescription>
              Заполните все анкеты для получения точных рекомендаций
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Общий прогресс</span>
                <span className="font-medium">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Карточки этапов */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Этап 1 - Предварительная анкета */}
          <Card className="relative overflow-hidden animate-scale-in">
            <div className={`absolute top-0 left-0 w-full h-1 ${
              surveyStatus?.stage1_completed ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={surveyStatus?.stage1_completed ? 'default' : 'secondary'}>
                  Этап 1
                </Badge>
                {surveyStatus?.stage1_completed && (
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                )}
              </div>
              <CardTitle className="text-xl">Предварительная анкета</CardTitle>
              <CardDescription className="text-sm">
                Базовая информация о вас (5 вопросов)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {surveyStatus?.stage1_completed ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Icon name="Check" size={16} />
                  <span>Завершено</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Уже заполнено
                </div>
              )}
            </CardContent>
          </Card>

          {/* Этап 2 - Расширенная анкета */}
          <Card className="relative overflow-hidden animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className={`absolute top-0 left-0 w-full h-1 ${
              surveyStatus?.stage2_completed ? 'bg-green-500' : 'bg-primary'
            }`} />
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={surveyStatus?.stage2_completed ? 'default' : 'outline'}>
                  Этап 2
                </Badge>
                {surveyStatus?.stage2_completed && (
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                )}
              </div>
              <CardTitle className="text-xl">Расширенная анкета</CardTitle>
              <CardDescription className="text-sm">
                Детальная информация о здоровье и образе жизни
              </CardDescription>
            </CardHeader>
            <CardContent>
              {surveyStatus?.stage2_completed ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                    <Icon name="Check" size={16} />
                    <span>Завершено</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setCurrentStage('stage2')}
                  >
                    <Icon name="Edit" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => setCurrentStage('stage2')}
                >
                  <Icon name="Play" size={16} className="mr-2" />
                  Начать заполнение
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Этап 3 - Анкета о питании */}
          <Card className="relative overflow-hidden animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className={`absolute top-0 left-0 w-full h-1 ${
              surveyStatus?.stage3_completed ? 'bg-green-500' : 'bg-primary'
            }`} />
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={surveyStatus?.stage3_completed ? 'default' : 'outline'}>
                  Этап 3
                </Badge>
                {surveyStatus?.stage3_completed && (
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                )}
              </div>
              <CardTitle className="text-xl">Питание и микронутриенты</CardTitle>
              <CardDescription className="text-sm">
                Информация о рационе и пищевых привычках
              </CardDescription>
            </CardHeader>
            <CardContent>
              {surveyStatus?.stage3_completed ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                    <Icon name="Check" size={16} />
                    <span>Завершено</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setCurrentStage('stage3')}
                  >
                    <Icon name="Edit" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => setCurrentStage('stage3')}
                >
                  <Icon name="Play" size={16} className="mr-2" />
                  Начать заполнение
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Рекомендации (показывать только после всех этапов) */}
        {surveyStatus?.stage1_completed && surveyStatus?.stage2_completed && surveyStatus?.stage3_completed && (
          <Card className="mt-8 animate-fade-in border-2 border-primary shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Icon name="Sparkles" size={28} className="text-primary" />
                Ваши персональные рекомендации
              </CardTitle>
              <CardDescription className="text-base">
                Комплексный анализ на основе всех заполненных анкет
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/5 text-center">
                    <Icon name="Target" size={24} className="mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Ваши цели</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 text-center">
                    <Icon name="Activity" size={24} className="mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Образ жизни</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 text-center">
                    <Icon name="Apple" size={24} className="mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Питание</p>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setCurrentStage('recommendations')}
                >
                  <Icon name="Eye" size={20} className="mr-2" />
                  Посмотреть детальные рекомендации
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Подсказка */}
        {!surveyStatus?.stage2_completed && (
          <Card className="mt-8 border-primary/20 bg-primary/5 animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="Info" size={20} className="text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Продолжите заполнение</h3>
                  <p className="text-sm text-muted-foreground">
                    Заполните расширенную анкету (Этап 2) и анкету о питании (Этап 3), 
                    чтобы получить максимально точные рекомендации по витаминам и добавкам.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface AdminProps {
  onBack: () => void;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  dosage: string;
  count: string;
  description: string;
  emoji: string;
  rating: number;
  popular: boolean;
  inStock: boolean;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface SurveyQuestion {
  id: number;
  questionText: string;
  questionType: string;
  options?: string[];
  isRequired: boolean;
  displayOrder: number;
  isActive: boolean;
}

interface SyncSetting {
  id: number;
  syncType: string;
  isActive: boolean;
  sourceUrl: string;
  scheduleMinutes: number;
  updatePricesOnly: boolean;
  lastSyncAt?: string;
  lastSyncStatus?: string;
}

interface SyncLog {
  id: number;
  startedAt: string;
  finishedAt?: string;
  status: string;
  itemsProcessed: number;
  itemsAdded: number;
  itemsUpdated: number;
  itemsSkipped: number;
  errorMessage?: string;
}

const Admin = ({ onBack }: AdminProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [syncSettings, setSyncSettings] = useState<SyncSetting[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingSyncSetting, setEditingSyncSetting] = useState<SyncSetting | null>(null);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  
  const [syncUrl, setSyncUrl] = useState('');
  const [syncProducts, setSyncProducts] = useState('');

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadQuestions();
    loadSyncSettings();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/6278c723-8882-4348-a57b-4a0136730417');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/5aa25205-978b-47a8-8f24-80c19fa25511');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/91d2a680-560a-4c90-8c01-c525dfc2e2b5?resource=survey');
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const loadSyncSettings = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/7b036231-df88-4c5e-adc8-37faa7e68731?resource=settings');
      const data = await response.json();
      setSyncSettings(data.settings || []);
    } catch (error) {
      console.error('Error loading sync settings:', error);
    }
  };

  const loadSyncLogs = async (settingId: number) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/7b036231-df88-4c5e-adc8-37faa7e68731?resource=logs&setting_id=${settingId}`);
      const data = await response.json();
      setSyncLogs(data.logs || []);
    } catch (error) {
      console.error('Error loading sync logs:', error);
    }
  };

  const handleSyncCatalog = async () => {
    if (!syncUrl && !syncProducts) {
      alert('Укажите URL каталога или вставьте JSON с товарами');
      return;
    }

    setLoading(true);
    try {
      let productsToSync = [];
      
      if (syncProducts) {
        productsToSync = JSON.parse(syncProducts);
      }

      const response = await fetch('https://functions.poehali.dev/7b036231-df88-4c5e-adc8-37faa7e68731', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalogUrl: syncUrl,
          products: productsToSync
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Успешно импортировано товаров: ${data.importedCount}`);
        loadProducts();
        setSyncUrl('');
        setSyncProducts('');
      }
    } catch (error) {
      alert('Ошибка при синхронизации каталога');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    setLoading(true);
    try {
      const method = editingProduct.id ? 'PUT' : 'POST';
      const response = await fetch('https://functions.poehali.dev/6278c723-8882-4348-a57b-4a0136730417', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Товар сохранён');
        loadProducts();
        setEditingProduct(null);
      }
    } catch (error) {
      alert('Ошибка при сохранении товара');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Удалить товар?')) return;

    try {
      await fetch(`https://functions.poehali.dev/6278c723-8882-4348-a57b-4a0136730417?id=${id}`, {
        method: 'DELETE'
      });
      loadProducts();
    } catch (error) {
      alert('Ошибка при удалении товара');
    }
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;

    setLoading(true);
    try {
      const method = editingQuestion.id ? 'PUT' : 'POST';
      const response = await fetch('https://functions.poehali.dev/91d2a680-560a-4c90-8c01-c525dfc2e2b5?resource=survey', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingQuestion)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Вопрос сохранён');
        loadQuestions();
        setEditingQuestion(null);
        setIsQuestionDialogOpen(false);
      }
    } catch (error) {
      alert('Ошибка при сохранении вопроса');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Удалить вопрос?')) return;

    try {
      await fetch(`https://functions.poehali.dev/91d2a680-560a-4c90-8c01-c525dfc2e2b5?resource=survey&id=${id}`, {
        method: 'DELETE'
      });
      loadQuestions();
    } catch (error) {
      alert('Ошибка при удалении вопроса');
    }
  };

  const handleMoveQuestion = async (id: number, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const currentQ = questions[index];
    const swapQ = questions[newIndex];

    try {
      await fetch('https://functions.poehali.dev/91d2a680-560a-4c90-8c01-c525dfc2e2b5?resource=survey', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentQ.id, displayOrder: swapQ.displayOrder })
      });

      await fetch('https://functions.poehali.dev/91d2a680-560a-4c90-8c01-c525dfc2e2b5?resource=survey', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: swapQ.id, displayOrder: currentQ.displayOrder })
      });

      loadQuestions();
    } catch (error) {
      alert('Ошибка при изменении порядка');
    }
  };

  const handleSaveSyncSetting = async () => {
    if (!editingSyncSetting) return;

    setLoading(true);
    try {
      const method = editingSyncSetting.id ? 'PUT' : 'POST';
      const response = await fetch('https://functions.poehali.dev/7b036231-df88-4c5e-adc8-37faa7e68731', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSyncSetting)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Настройка сохранена');
        loadSyncSettings();
        setEditingSyncSetting(null);
        setIsSyncDialogOpen(false);
      }
    } catch (error) {
      alert('Ошибка при сохранении настройки');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSync = async (settingId: number) => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/7b036231-df88-4c5e-adc8-37faa7e68731?action=sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settingId })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Синхронизация завершена!\nДобавлено: ${data.itemsAdded}\nОбновлено: ${data.itemsUpdated}\nПропущено: ${data.itemsSkipped}`);
        loadProducts();
        loadSyncSettings();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      alert('Ошибка при синхронизации');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSyncActive = async (setting: SyncSetting) => {
    try {
      await fetch('https://functions.poehali.dev/7b036231-df88-4c5e-adc8-37faa7e68731', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: setting.id, isActive: !setting.isActive })
      });
      loadSyncSettings();
    } catch (error) {
      alert('Ошибка при изменении статуса');
    }
  };

  const handleDeleteSyncSetting = async (id: number) => {
    if (!confirm('Отключить эту синхронизацию?')) return;

    try {
      await fetch(`https://functions.poehali.dev/7b036231-df88-4c5e-adc8-37faa7e68731?id=${id}`, {
        method: 'DELETE'
      });
      loadSyncSettings();
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="rounded-full">
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Панель администратора</h1>
              <p className="text-muted-foreground mt-1">Управление каталогом и заказами</p>
            </div>
          </div>
          <Badge variant="outline" className="px-4 py-2">
            <Icon name="Shield" size={16} className="mr-2" />
            Admin
          </Badge>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">
              <Icon name="Package" size={18} className="mr-2" />
              Товары ({products.length})
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Icon name="ShoppingBag" size={18} className="mr-2" />
              Заказы ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="survey">
              <Icon name="ClipboardList" size={18} className="mr-2" />
              Анкета ({questions.length})
            </TabsTrigger>
            <TabsTrigger value="sync">
              <Icon name="RefreshCw" size={18} className="mr-2" />
              Синхронизация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Каталог товаров</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingProduct({ 
                    id: 0, name: '', category: '', price: 0, dosage: '', count: '', 
                    description: '', emoji: '💊', rating: 0, popular: false, inStock: true 
                  })}>
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить товар
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct?.id ? 'Редактировать товар' : 'Новый товар'}
                    </DialogTitle>
                  </DialogHeader>
                  {editingProduct && (
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Название *</Label>
                          <Input
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                            placeholder="Витамин D3"
                          />
                        </div>
                        <div>
                          <Label>Категория</Label>
                          <Input
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                            placeholder="Витамины"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Цена (₽) *</Label>
                          <Input
                            type="number"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label>Дозировка</Label>
                          <Input
                            value={editingProduct.dosage}
                            onChange={(e) => setEditingProduct({...editingProduct, dosage: e.target.value})}
                            placeholder="2000 МЕ"
                          />
                        </div>
                        <div>
                          <Label>Количество</Label>
                          <Input
                            value={editingProduct.count}
                            onChange={(e) => setEditingProduct({...editingProduct, count: e.target.value})}
                            placeholder="90 капсул"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Описание</Label>
                        <Textarea
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                          placeholder="Краткое описание товара"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Emoji</Label>
                          <Input
                            value={editingProduct.emoji}
                            onChange={(e) => setEditingProduct({...editingProduct, emoji: e.target.value})}
                            placeholder="☀️"
                          />
                        </div>
                        <div>
                          <Label>Рейтинг</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={editingProduct.rating}
                            onChange={(e) => setEditingProduct({...editingProduct, rating: Number(e.target.value)})}
                          />
                        </div>
                        <div className="flex items-center gap-4 pt-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.popular}
                              onChange={(e) => setEditingProduct({...editingProduct, popular: e.target.checked})}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Популярный</span>
                          </label>
                        </div>
                      </div>
                      
                      <Button onClick={handleSaveProduct} disabled={loading} className="w-full">
                        {loading ? 'Сохранение...' : 'Сохранить'}
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Товар</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Рейтинг</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{product.emoji}</span>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.dosage}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{product.price} ₽</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                          <span>{product.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {product.popular && <Badge className="text-xs">Популярное</Badge>}
                          {product.inStock ? (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">В наличии</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-600">Нет в наличии</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-xl font-bold">Заказы</h2>
            
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер заказа</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Оплата</TableHead>
                    <TableHead>Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell className="font-semibold">{order.totalAmount} ₽</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                          {order.status === 'pending' ? 'В обработке' : order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.paymentStatus === 'pending' ? 'outline' : 'default'}>
                          {order.paymentStatus === 'pending' ? 'Ожидает' : order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Автоматическая синхронизация</h2>
              <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingSyncSetting({
                      id: 0,
                      syncType: 'google_sheets',
                      isActive: false,
                      sourceUrl: '',
                      scheduleMinutes: 60,
                      updatePricesOnly: false
                    });
                    setIsSyncDialogOpen(true);
                  }}>
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить синхронизацию
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSyncSetting?.id ? 'Редактировать синхронизацию' : 'Новая синхронизация'}
                    </DialogTitle>
                  </DialogHeader>
                  {editingSyncSetting && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Тип синхронизации</Label>
                        <select
                          value={editingSyncSetting.syncType}
                          onChange={(e) => setEditingSyncSetting({...editingSyncSetting, syncType: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md mt-2"
                        >
                          <option value="google_sheets">Google Таблицы</option>
                          <option value="website">Парсинг сайта</option>
                        </select>
                      </div>

                      <div>
                        <Label>
                          {editingSyncSetting.syncType === 'google_sheets' 
                            ? 'Ссылка на Google Таблицу' 
                            : 'URL сайта для парсинга'}
                        </Label>
                        <Input
                          value={editingSyncSetting.sourceUrl}
                          onChange={(e) => setEditingSyncSetting({...editingSyncSetting, sourceUrl: e.target.value})}
                          placeholder={editingSyncSetting.syncType === 'google_sheets'
                            ? 'https://docs.google.com/spreadsheets/d/...'
                            : 'https://example.com/catalog'}
                          className="mt-2"
                        />
                        {editingSyncSetting.syncType === 'google_sheets' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Опубликуйте таблицу: Файл → Опубликовать в интернете
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Периодичность обновления</Label>
                          <select
                            value={editingSyncSetting.scheduleMinutes}
                            onChange={(e) => setEditingSyncSetting({...editingSyncSetting, scheduleMinutes: Number(e.target.value)})}
                            className="w-full px-3 py-2 border rounded-md mt-2"
                          >
                            <option value={15}>Каждые 15 минут</option>
                            <option value={30}>Каждые 30 минут</option>
                            <option value={60}>Каждый час</option>
                            <option value={180}>Каждые 3 часа</option>
                            <option value={360}>Каждые 6 часов</option>
                            <option value={720}>Каждые 12 часов</option>
                            <option value={1440}>Раз в день</option>
                          </select>
                        </div>

                        <div className="flex flex-col justify-end">
                          <label className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-accent">
                            <input
                              type="checkbox"
                              checked={editingSyncSetting.updatePricesOnly}
                              onChange={(e) => setEditingSyncSetting({...editingSyncSetting, updatePricesOnly: e.target.checked})}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Обновлять только цены</span>
                          </label>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                          <strong>Обновлять только цены:</strong> если включено, система будет искать товары по названию 
                          и обновлять только цену. Новые товары добавляться не будут.
                        </p>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveSyncSetting} disabled={loading} className="flex-1">
                          {loading ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditingSyncSetting(null);
                            setIsSyncDialogOpen(false);
                          }}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Тип</TableHead>
                    <TableHead>Источник</TableHead>
                    <TableHead className="w-32">Периодичность</TableHead>
                    <TableHead className="w-24 text-center">Режим</TableHead>
                    <TableHead className="w-32">Последняя синхр.</TableHead>
                    <TableHead className="w-24 text-center">Статус</TableHead>
                    <TableHead className="w-48 text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncSettings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Нет настроенных синхронизаций. Нажмите "Добавить синхронизацию" чтобы начать.
                      </TableCell>
                    </TableRow>
                  ) : (
                    syncSettings.map((setting) => (
                      <TableRow key={setting.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {setting.syncType === 'google_sheets' && (
                              <><Icon name="Table" size={14} className="mr-1" />Google Sheets</>
                            )}
                            {setting.syncType === 'website' && (
                              <><Icon name="Globe" size={14} className="mr-1" />Парсинг</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm">
                          {setting.sourceUrl}
                        </TableCell>
                        <TableCell className="text-sm">
                          {setting.scheduleMinutes < 60 
                            ? `${setting.scheduleMinutes} мин`
                            : setting.scheduleMinutes === 60 
                              ? '1 час'
                              : `${Math.floor(setting.scheduleMinutes / 60)} ч`}
                        </TableCell>
                        <TableCell className="text-center">
                          {setting.updatePricesOnly ? (
                            <Badge variant="secondary" className="text-xs">Только цены</Badge>
                          ) : (
                            <Badge variant="default" className="text-xs">Полная</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {setting.lastSyncAt 
                            ? new Date(setting.lastSyncAt).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Ещё не запускалась'}
                        </TableCell>
                        <TableCell className="text-center">
                          {setting.isActive ? (
                            <Badge className="bg-green-500 text-xs">Активна</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Остановлена</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRunSync(setting.id)}
                              disabled={loading}
                              title="Запустить сейчас"
                            >
                              <Icon name="Play" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleSyncActive(setting)}
                              title={setting.isActive ? 'Остановить' : 'Запустить'}
                            >
                              {setting.isActive ? (
                                <Icon name="Pause" size={16} />
                              ) : (
                                <Icon name="Power" size={16} />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                loadSyncLogs(setting.id);
                              }}
                              title="Посмотреть логи"
                            >
                              <Icon name="FileText" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingSyncSetting(setting);
                                setIsSyncDialogOpen(true);
                              }}
                            >
                              <Icon name="Pencil" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSyncSetting(setting.id)}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            {syncLogs.length > 0 && (
              <Card className="mt-6">
                <div className="p-4 border-b">
                  <h3 className="font-bold flex items-center gap-2">
                    <Icon name="History" size={18} />
                    История синхронизаций
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {syncLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {log.status === 'success' ? 'Успешно' : 'Ошибка'}
                          </Badge>
                          <span className="text-sm">
                            {new Date(log.startedAt).toLocaleString('ru-RU')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            +{log.itemsAdded} / ~{log.itemsUpdated} / -{log.itemsSkipped}
                          </span>
                        </div>
                        {log.errorMessage && (
                          <span className="text-xs text-destructive">{log.errorMessage}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="survey" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Вопросы анкеты</h2>
              <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingQuestion({ 
                      id: 0, 
                      questionText: '', 
                      questionType: 'text', 
                      options: undefined, 
                      isRequired: true, 
                      displayOrder: questions.length + 1,
                      isActive: true
                    });
                    setIsQuestionDialogOpen(true);
                  }}>
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить вопрос
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuestion?.id ? 'Редактировать вопрос' : 'Новый вопрос'}
                    </DialogTitle>
                  </DialogHeader>
                  {editingQuestion && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Текст вопроса *</Label>
                        <Input
                          value={editingQuestion.questionText}
                          onChange={(e) => setEditingQuestion({...editingQuestion, questionText: e.target.value})}
                          placeholder="Как вас зовут?"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Тип вопроса</Label>
                          <select
                            value={editingQuestion.questionType}
                            onChange={(e) => setEditingQuestion({...editingQuestion, questionType: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="text">Текст (одна строка)</option>
                            <option value="textarea">Текст (несколько строк)</option>
                            <option value="number">Число</option>
                            <option value="radio">Выбор одного варианта</option>
                            <option value="checkbox">Выбор нескольких</option>
                            <option value="select">Выпадающий список</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-4 pt-6">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingQuestion.isRequired}
                              onChange={(e) => setEditingQuestion({...editingQuestion, isRequired: e.target.checked})}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Обязательный</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingQuestion.isActive}
                              onChange={(e) => setEditingQuestion({...editingQuestion, isActive: e.target.checked})}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Активен</span>
                          </label>
                        </div>
                      </div>

                      {['radio', 'checkbox', 'select'].includes(editingQuestion.questionType) && (
                        <div>
                          <Label>Варианты ответов (каждый с новой строки)</Label>
                          <Textarea
                            value={editingQuestion.options?.join('\n') || ''}
                            onChange={(e) => setEditingQuestion({
                              ...editingQuestion, 
                              options: e.target.value.split('\n').filter(o => o.trim())
                            })}
                            placeholder="Вариант 1&#10;Вариант 2&#10;Вариант 3"
                            rows={5}
                          />
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveQuestion} disabled={loading} className="flex-1">
                          {loading ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditingQuestion(null);
                            setIsQuestionDialogOpen(false);
                          }}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Вопрос</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead className="w-24 text-center">Обяз.</TableHead>
                    <TableHead className="w-24 text-center">Статус</TableHead>
                    <TableHead className="w-32 text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question, index) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-mono text-muted-foreground">
                        {question.displayOrder}
                      </TableCell>
                      <TableCell className="font-medium">
                        {question.questionText}
                        {question.options && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {question.options.slice(0, 3).join(', ')}
                            {question.options.length > 3 && '...'}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {question.questionType === 'text' && 'Текст'}
                          {question.questionType === 'textarea' && 'Многострочный'}
                          {question.questionType === 'number' && 'Число'}
                          {question.questionType === 'radio' && 'Один вариант'}
                          {question.questionType === 'checkbox' && 'Множественный'}
                          {question.questionType === 'select' && 'Список'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {question.isRequired ? (
                          <Badge variant="destructive" className="text-xs">Да</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Нет</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {question.isActive ? (
                          <Badge className="bg-green-500 text-xs">Активен</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Неактивен</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveQuestion(question.id, 'up')}
                            disabled={index === 0}
                          >
                            <Icon name="ChevronUp" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveQuestion(question.id, 'down')}
                            disabled={index === questions.length - 1}
                          >
                            <Icon name="ChevronDown" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingQuestion(question);
                              setIsQuestionDialogOpen(true);
                            }}
                          >
                            <Icon name="Pencil" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
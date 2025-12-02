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

const Admin = ({ onBack }: AdminProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [syncUrl, setSyncUrl] = useState('');
  const [syncProducts, setSyncProducts] = useState('');

  useEffect(() => {
    loadProducts();
    loadOrders();
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">
              <Icon name="Package" size={18} className="mr-2" />
              Товары ({products.length})
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Icon name="ShoppingBag" size={18} className="mr-2" />
              Заказы ({orders.length})
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
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Download" size={24} className="text-primary" />
                Синхронизация каталога
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sync-url">URL внешнего каталога</Label>
                  <Input
                    id="sync-url"
                    placeholder="https://example.com/api/products"
                    value={syncUrl}
                    onChange={(e) => setSyncUrl(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Укажите ссылку на JSON API с товарами
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="sync-products">Или вставьте JSON с товарами</Label>
                  <Textarea
                    id="sync-products"
                    placeholder={`[
  {
    "name": "Витамин D3",
    "category": "Витамины",
    "price": 890,
    "dosage": "2000 МЕ",
    "count": "90 капсул",
    "description": "Описание",
    "emoji": "☀️",
    "rating": 4.8
  }
]`}
                    value={syncProducts}
                    onChange={(e) => setSyncProducts(e.target.value)}
                    className="mt-2 font-mono text-sm"
                    rows={12}
                  />
                </div>
                
                <Button onClick={handleSyncCatalog} disabled={loading} size="lg" className="w-full">
                  {loading ? 'Синхронизация...' : 'Синхронизировать каталог'}
                  <Icon name="RefreshCw" className="ml-2" size={20} />
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

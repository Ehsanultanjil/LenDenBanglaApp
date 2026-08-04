import { useState } from 'react';
import { View, ScrollView, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Icons from 'lucide-react-native';
import {
  Check, Clock, AlertCircle, Plus, Receipt, Zap, Flame, Wifi, Play, Music, Home, Smartphone, Calendar,
} from 'lucide-react-native';
import { PageHeader } from '@/components/PageHeader';
import { PressableScale } from '@/components/PressableScale';
import { Sheet } from '@/components/Sheet';
import { Text, TextInput } from '@/components/AppText';
import { LoadingState, ErrorState, EmptyState } from '@/components/StateView';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useBills, useCreateBill } from '@/api/bills';
import type { Bill } from '@/data/types';

const FILTERS = ['all', 'upcoming', 'paid', 'overdue'] as const;

const ICON_OPTIONS = { Zap, Flame, Wifi, Play, Music, Home, Smartphone, Receipt } as const;
const ICON_KEYS = Object.keys(ICON_OPTIONS) as (keyof typeof ICON_OPTIONS)[];
const COLOR_OPTIONS = ['#46D6A8', '#4ADE80', '#FACC15', '#F87171', '#94A3B8'];

export default function BillsScreen() {
  const { strings, formatCurrency, formatNumber } = useLanguage();
  const t = strings.bills;

  const { data: bills, isPending, isError, refetch } = useBills();
  const createBill = useCreateBill();

  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurring, setRecurring] = useState(true);
  const [icon, setIcon] = useState<keyof typeof ICON_OPTIONS>('Zap');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);

  const statusConfig = {
    upcoming: { color: '#FACC15', icon: Clock, label: t.upcoming },
    paid: { color: '#4ADE80', icon: Check, label: t.paid },
    overdue: { color: '#F87171', icon: AlertCircle, label: t.overdue },
  } as const;

  const list = bills ?? [];
  const filtered = filter === 'all' ? list : list.filter((b) => b.status === filter);
  const totalUpcoming = list.filter((b) => b.status === 'upcoming').reduce((s, b) => s + b.amount, 0);
  const totalOverdue = list.filter((b) => b.status === 'overdue').reduce((s, b) => s + b.amount, 0);

  const groups: { key: 'overdue' | 'upcoming' | 'paid'; items: Bill[] }[] = [
    { key: 'overdue', items: filtered.filter((b) => b.status === 'overdue') },
    { key: 'upcoming', items: filtered.filter((b) => b.status === 'upcoming') },
    { key: 'paid', items: filtered.filter((b) => b.status === 'paid') },
  ];

  const numericAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const canCreate = name.trim().length > 0 && numericAmount > 0 && !createBill.isPending;

  const resetForm = () => {
    setName('');
    setCategory('');
    setAmount('');
    setDueDate(new Date());
    setRecurring(true);
    setIcon('Zap');
    setColor(COLOR_OPTIONS[0]);
    setError(null);
  };

  const handleCreate = async () => {
    if (!canCreate) return;
    try {
      await createBill.mutateAsync({
        name: name.trim(),
        category: category.trim() || 'Utility',
        icon,
        amount: numericAmount,
        dueDate: dueDate.toISOString().split('T')[0],
        recurring,
        color,
      });
      setShowCreate(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : strings.common.errorTitle);
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <ScrollView className="flex-1">
        <PageHeader title={t.title} subtitle={t.subtitle} />

        {isPending ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <View className="px-5 pb-8">
            <View className="flex-row gap-3">
              <View className="flex-1 bg-card rounded-3xl p-5">
                <View className="flex-row items-center gap-2 mb-2">
                  <Clock size={14} color="#FACC15" />
                  <Text className="text-2xs text-text-secondary uppercase tracking-wider">{t.upcoming}</Text>
                </View>
                <Text className="text-xl font-bold text-text-primary">{formatCurrency(totalUpcoming, true)}</Text>
                <Text className="text-2xs text-text-secondary mt-1">
                  {t.billsCount(list.filter((b) => b.status === 'upcoming').length)}
                </Text>
              </View>
              <View className="flex-1 bg-card rounded-3xl p-5">
                <View className="flex-row items-center gap-2 mb-2">
                  <AlertCircle size={14} color="#F87171" />
                  <Text className="text-2xs text-text-secondary uppercase tracking-wider">{t.overdue}</Text>
                </View>
                <Text className="text-xl font-bold text-danger">{formatCurrency(totalOverdue, true)}</Text>
                <Text className="text-2xs text-text-secondary mt-1">
                  {t.billsCount(list.filter((b) => b.status === 'overdue').length)}
                </Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5 -mx-5 px-5">
              <View className="flex-row gap-2">
                {FILTERS.map((f) => (
                  <PressableScale
                    key={f}
                    onPress={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full ${filter === f ? 'bg-accent' : 'bg-card'}`}
                  >
                    <Text className={`text-sm font-medium ${filter === f ? 'text-bg' : 'text-text-secondary'}`}>
                      {f === 'all' ? t.all : statusConfig[f].label}
                    </Text>
                  </PressableScale>
                ))}
              </View>
            </ScrollView>

            {list.length === 0 ? (
              <EmptyState message={t.empty} />
            ) : (
              <View className="mt-6 gap-6">
                {groups.map(({ key, items }) => {
                  if (items.length === 0) return null;
                  const config = statusConfig[key];
                  return (
                    <View key={key}>
                      <View className="flex-row items-center gap-2 mb-3 px-1">
                        <config.icon size={14} color={config.color} />
                        <Text className="text-sm font-semibold text-text-secondary uppercase tracking-wider">{config.label}</Text>
                        <Text className="text-2xs text-text-secondary">· {formatNumber(items.length)}</Text>
                      </View>

                      <View className="relative pl-6">
                        <View className="absolute left-2 top-2 bottom-2 w-px bg-divider" />

                        <View className="gap-3">
                          {items.map((bill) => {
                            const Icon = (Icons as unknown as Record<string, typeof Receipt>)[bill.icon] ?? Receipt;
                            const daysUntil = Math.ceil((new Date(bill.dueDate).getTime() - Date.now()) / 86400000);
                            return (
                              <View key={bill.id} className="relative">
                                <View
                                  className="absolute -left-[18px] top-5 w-3 h-3 rounded-full border-2 border-bg"
                                  style={{ backgroundColor: bill.color }}
                                />
                                <View className="w-full bg-card rounded-2xl p-3.5">
                                  <View className="flex-row items-center gap-3">
                                    <View className="w-9 h-9 rounded-full items-center justify-center shrink-0" style={{ backgroundColor: `${bill.color}22` }}>
                                      <Icon size={16} color={bill.color} />
                                    </View>
                                    <View className="flex-1 min-w-0">
                                      <Text className="text-sm font-medium text-text-primary" numberOfLines={1}>{bill.name}</Text>
                                      <View className="flex-row items-center gap-2 mt-0.5">
                                        <Text className="text-xs text-text-secondary">
                                          {bill.status === 'upcoming' && (daysUntil === 0 ? t.dueToday : daysUntil > 0 ? t.dueInDays(daysUntil) : t.daysAgo(Math.abs(daysUntil)))}
                                          {bill.status === 'paid' && t.paid}
                                          {bill.status === 'overdue' && t.daysOverdue(Math.abs(daysUntil))}
                                        </Text>
                                        {bill.status === 'upcoming' && (
                                          <PressableScale
                                            accessibilityRole="button"
                                            accessibilityLabel={`${t.payNow} — ${bill.name}`}
                                            hitSlop={{ top: 14, bottom: 14, left: 10, right: 10 }}
                                            className="px-2.5 py-1 rounded-full bg-accent/10"
                                          >
                                            <Text className="text-2xs font-semibold text-accent">{t.payNow}</Text>
                                          </PressableScale>
                                        )}
                                      </View>
                                    </View>
                                    <View className="items-end shrink-0">
                                      <Text className="text-sm font-semibold text-text-primary">{formatCurrency(bill.amount)}</Text>
                                      {bill.recurring && <Text className="text-2xs text-text-secondary">{t.recurring}</Text>}
                                    </View>
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <PressableScale
              onPress={() => { resetForm(); setShowCreate(true); }}
              className="w-full mt-4 py-4 rounded-3xl border border-dashed border-divider flex-row items-center justify-center gap-2"
            >
              <Plus size={18} color="#94A3B8" />
              <Text className="text-base font-medium text-text-secondary">{t.addBill}</Text>
            </PressableScale>
          </View>
        )}
      </ScrollView>

      <Sheet open={showCreate} onClose={() => setShowCreate(false)} title={t.formTitle}>
        <View className="px-5 pb-4 gap-4">
          <View>
            <Text className="text-sm text-text-secondary mb-2">{t.billName}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t.billNamePlaceholder}
              placeholderTextColor="#4B5563"
              className="bg-card rounded-2xl px-4 py-3.5 text-base text-text-primary"
            />
          </View>

          <View>
            <Text className="text-sm text-text-secondary mb-2">{t.category}</Text>
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder={t.categoryPlaceholder}
              placeholderTextColor="#4B5563"
              className="bg-card rounded-2xl px-4 py-3.5 text-base text-text-primary"
            />
          </View>

          <View>
            <Text className="text-sm text-text-secondary mb-2">{t.amount}</Text>
            <View className="flex-row items-center bg-card rounded-2xl px-4">
              <Text className="text-base text-text-secondary mr-1">৳</Text>
              <TextInput
                value={amount}
                onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
                placeholder="0"
                placeholderTextColor="#4B5563"
                keyboardType="number-pad"
                className="flex-1 py-3.5 text-base text-text-primary"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm text-text-secondary mb-2">{t.dueDate}</Text>
            <PressableScale
              onPress={() => setShowDatePicker(true)}
              className="bg-card rounded-2xl px-4 py-3.5 flex-row items-center gap-3"
            >
              <Calendar size={18} color="#94A3B8" />
              <Text className="text-base text-text-primary">
                {dueDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </PressableScale>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(_, selected) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selected) setDueDate(selected);
              }}
            />
          )}

          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-text-secondary">{t.isRecurring}</Text>
            <Switch
              value={recurring}
              onValueChange={setRecurring}
              trackColor={{ false: '#1E2A3C', true: '#46D6A8' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View>
            <Text className="text-sm text-text-secondary mb-2">{t.pickIcon}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {ICON_KEYS.map((key) => {
                  const Icon = ICON_OPTIONS[key];
                  const active = icon === key;
                  return (
                    <PressableScale
                      key={key}
                      onPress={() => setIcon(key)}
                      className="w-12 h-12 rounded-2xl items-center justify-center"
                      style={{ backgroundColor: active ? `${color}33` : '#171F2E' }}
                    >
                      <Icon size={20} color={active ? color : '#94A3B8'} />
                    </PressableScale>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View>
            <Text className="text-sm text-text-secondary mb-2">{t.pickColor}</Text>
            <View className="flex-row gap-2">
              {COLOR_OPTIONS.map((c) => (
                <PressableScale
                  key={c}
                  onPress={() => setColor(c)}
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${c}22` }}
                >
                  <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: c }}>
                    {color === c && <Check size={14} color="#090B10" strokeWidth={3} />}
                  </View>
                </PressableScale>
              ))}
            </View>
          </View>

          {error && <Text className="text-sm text-danger">{error}</Text>}

          <PressableScale
            onPress={handleCreate}
            disabled={!canCreate}
            className={`w-full py-4 rounded-2xl bg-accent items-center mt-2 ${!canCreate ? 'opacity-30' : ''}`}
          >
            <Text className="text-bg text-base font-bold">
              {createBill.isPending ? strings.common.saving : t.save}
            </Text>
          </PressableScale>
        </View>
      </Sheet>
    </View>
  );
}

import { useState } from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Shield, Laptop, Bike, Plane, Heart, Plus, Target, Calendar, Check } from 'lucide-react-native';
import { PageHeader } from '@/components/PageHeader';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { CircularProgress } from '@/components/CircularProgress';
import { PressableScale } from '@/components/PressableScale';
import { Sheet } from '@/components/Sheet';
import { Text, TextInput } from '@/components/AppText';
import { LoadingState, ErrorState, EmptyState } from '@/components/StateView';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGoals, useCreateGoal, useAddToGoal } from '@/api/goals';
import type { Goal } from '@/data/types';

/**
 * Only these icons render — anything else falls back to Target, so the create
 * form must offer exactly this set.
 */
const goalIcons = { Shield, Laptop, Bike, Plane, Heart } as const;
const ICON_OPTIONS = Object.keys(goalIcons) as (keyof typeof goalIcons)[];
const COLOR_OPTIONS = ['#46D6A8', '#4ADE80', '#FACC15', '#F87171', '#94A3B8'];

export default function GoalsScreen() {
  const { strings, formatCurrency, formatNumber } = useLanguage();
  const t = strings.goals;

  const { data: goals, isPending, isError, refetch } = useGoals();
  const createGoal = useCreateGoal();
  const addToGoal = useAddToGoal();

  const [addingTo, setAddingTo] = useState<Goal | null>(null);
  const [amount, setAmount] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [monthly, setMonthly] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [icon, setIcon] = useState<keyof typeof goalIcons>('Shield');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);

  const list = goals ?? [];
  const totalSaved = list.reduce((s, g) => s + g.saved, 0);
  const totalTarget = list.reduce((s, g) => s + g.target, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const numericAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const numericTarget = parseFloat(target.replace(/,/g, '')) || 0;
  const numericMonthly = parseFloat(monthly.replace(/,/g, '')) || 0;
  const canCreate = name.trim().length > 0 && numericTarget > 0 && !createGoal.isPending;

  const resetCreateForm = () => {
    setName('');
    setTarget('');
    setMonthly('');
    setIcon('Shield');
    setColor(COLOR_OPTIONS[0]);
    setError(null);
  };

  const handleAddMoney = async () => {
    if (!addingTo || numericAmount <= 0) return;
    try {
      await addToGoal.mutateAsync({ goalId: addingTo.id, amount: numericAmount });
      setAddingTo(null);
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : strings.common.errorTitle);
    }
  };

  const handleCreate = async () => {
    if (!canCreate) return;
    try {
      await createGoal.mutateAsync({
        name: name.trim(),
        target: numericTarget,
        deadline: deadline.toISOString().split('T')[0],
        icon,
        color,
        monthlyContribution: numericMonthly > 0 ? numericMonthly : undefined,
      });
      setShowCreate(false);
      resetCreateForm();
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
            <View className="bg-card rounded-3xl p-5">
              <View className="flex-row items-center gap-5">
                <CircularProgress size={112} strokeWidth={8} pct={overallPct} color="#46D6A8">
                  <Text className="text-2xl font-bold text-text-primary">{formatNumber(overallPct)}%</Text>
                  <Text className="text-2xs text-text-secondary">{t.complete}</Text>
                </CircularProgress>
                <View className="flex-1">
                  <Text className="text-sm text-text-secondary">{t.totalSaved}</Text>
                  <AnimatedNumber value={totalSaved} className="text-2xl font-bold text-text-primary" />
                  <Text className="text-sm text-text-secondary mt-1">{t.of} {formatCurrency(totalTarget, true)}</Text>
                </View>
              </View>
            </View>

            {list.length === 0 ? (
              <EmptyState message={t.empty} />
            ) : (
              <View className="mt-6 gap-4">
                {list.map((goal) => {
                  const Icon = goalIcons[goal.icon as keyof typeof goalIcons] ?? Target;
                  const pct = goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0;
                  const remaining = Math.max(goal.target - goal.saved, 0);
                  return (
                    <View key={goal.id} className="rounded-3xl overflow-hidden">
                      <LinearGradient
                        colors={[`${goal.color}15`, '#171F2E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-5"
                      >
                        <View className="flex-row items-center gap-4 mb-5">
                          <View className="w-14 h-14 rounded-2xl items-center justify-center shrink-0" style={{ backgroundColor: `${goal.color}22` }}>
                            <Icon size={24} color={goal.color} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-lg font-bold text-text-primary">{goal.name}</Text>
                            <Text className="text-sm text-text-secondary">
                              {formatCurrency(goal.saved, true)} {t.of} {formatCurrency(goal.target, true)}
                            </Text>
                          </View>
                          <Text className="text-2xl font-bold" style={{ color: goal.color }}>{formatNumber(pct)}%</Text>
                        </View>

                        <View className="h-2.5 rounded-full bg-card-hover overflow-hidden">
                          <View className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: goal.color }} />
                        </View>

                        <View className="flex-row items-center justify-between mt-4">
                          <View>
                            <Text className="text-2xs text-text-secondary uppercase tracking-wider">{t.remaining}</Text>
                            <Text className="text-sm font-semibold text-text-primary">{formatCurrency(remaining, true)}</Text>
                          </View>
                          {goal.monthlyContribution != null && (
                            <View className="items-end">
                              <Text className="text-2xs text-text-secondary uppercase tracking-wider">{t.monthly}</Text>
                              <Text className="text-sm font-semibold text-text-primary">{formatCurrency(goal.monthlyContribution, true)}</Text>
                            </View>
                          )}
                          <View className="items-end">
                            <Text className="text-2xs text-text-secondary uppercase tracking-wider">{t.deadline}</Text>
                            <Text className="text-sm font-semibold text-text-primary">
                              {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                            </Text>
                          </View>
                        </View>

                        <PressableScale
                          onPress={() => { setAddingTo(goal); setAmount(''); setError(null); }}
                          className="w-full mt-4 py-2.5 rounded-xl items-center flex-row justify-center gap-1.5"
                          style={{ backgroundColor: `${goal.color}18` }}
                        >
                          <Plus size={14} color={goal.color} />
                          <Text className="text-sm font-semibold" style={{ color: goal.color }}>{t.addMoney}</Text>
                        </PressableScale>
                      </LinearGradient>
                    </View>
                  );
                })}
              </View>
            )}

            <PressableScale
              onPress={() => { resetCreateForm(); setShowCreate(true); }}
              className="w-full mt-4 py-4 rounded-3xl border border-dashed border-divider flex-row items-center justify-center gap-2"
            >
              <Plus size={18} color="#94A3B8" />
              <Text className="text-base font-medium text-text-secondary">{t.createNewGoal}</Text>
            </PressableScale>
          </View>
        )}
      </ScrollView>

      <Sheet open={!!addingTo} onClose={() => setAddingTo(null)} title={addingTo ? t.addMoneyTo(addingTo.name) : undefined}>
        <View className="px-5 pb-4">
          <View className="flex-row items-center justify-center gap-2 py-6">
            <Text className="text-2xl font-bold text-text-primary">৳</Text>
            <TextInput
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
              placeholder="0"
              placeholderTextColor="#4B5563"
              keyboardType="number-pad"
              autoFocus
              className="text-4xl font-bold text-text-primary text-center w-40"
            />
          </View>
          {error && <Text className="text-sm text-danger text-center mb-3">{error}</Text>}
          <PressableScale
            onPress={handleAddMoney}
            disabled={numericAmount <= 0 || addToGoal.isPending}
            className={`w-full py-4 rounded-2xl bg-accent items-center ${numericAmount <= 0 || addToGoal.isPending ? 'opacity-30' : ''}`}
          >
            <Text className="text-bg text-base font-bold">
              {addToGoal.isPending ? strings.common.saving : t.add}
            </Text>
          </PressableScale>
        </View>
      </Sheet>

      <Sheet open={showCreate} onClose={() => setShowCreate(false)} title={t.formTitle}>
        <View className="px-5 pb-4 gap-4">
          <View>
            <Text className="text-sm text-text-secondary mb-2">{t.goalName}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t.goalNamePlaceholder}
              placeholderTextColor="#4B5563"
              className="bg-card rounded-2xl px-4 py-3.5 text-base text-text-primary"
            />
          </View>

          <View>
            <Text className="text-sm text-text-secondary mb-2">{t.targetAmount}</Text>
            <View className="flex-row items-center bg-card rounded-2xl px-4">
              <Text className="text-base text-text-secondary mr-1">৳</Text>
              <TextInput
                value={target}
                onChangeText={(v) => setTarget(v.replace(/[^0-9]/g, ''))}
                placeholder="0"
                placeholderTextColor="#4B5563"
                keyboardType="number-pad"
                className="flex-1 py-3.5 text-base text-text-primary"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm text-text-secondary mb-2">{t.monthlyOptional}</Text>
            <View className="flex-row items-center bg-card rounded-2xl px-4">
              <Text className="text-base text-text-secondary mr-1">৳</Text>
              <TextInput
                value={monthly}
                onChangeText={(v) => setMonthly(v.replace(/[^0-9]/g, ''))}
                placeholder="0"
                placeholderTextColor="#4B5563"
                keyboardType="number-pad"
                className="flex-1 py-3.5 text-base text-text-primary"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm text-text-secondary mb-2">{t.deadline}</Text>
            <PressableScale
              onPress={() => setShowDatePicker(true)}
              className="bg-card rounded-2xl px-4 py-3.5 flex-row items-center gap-3"
            >
              <Calendar size={18} color="#94A3B8" />
              <Text className="text-base text-text-primary">
                {deadline.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </PressableScale>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={deadline}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(_, selected) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selected) setDeadline(selected);
              }}
            />
          )}

          <View>
            <Text className="text-sm text-text-secondary mb-2">{t.pickIcon}</Text>
            <View className="flex-row gap-2">
              {ICON_OPTIONS.map((key) => {
                const Icon = goalIcons[key];
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
              {createGoal.isPending ? strings.common.saving : t.save}
            </Text>
          </PressableScale>
        </View>
      </Sheet>
    </View>
  );
}

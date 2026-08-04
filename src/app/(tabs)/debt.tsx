import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Phone, Plus, ArrowUpRight, ArrowDownRight, History } from 'lucide-react-native';
import { PageHeader } from '@/components/PageHeader';
import { Sheet } from '@/components/Sheet';
import { PressableScale } from '@/components/PressableScale';
import { Text, TextInput } from '@/components/AppText';
import { LoadingState, ErrorState, EmptyState } from '@/components/StateView';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useDebts, useCreateDebt } from '@/api/debts';
import type { Debt } from '@/data/types';

export default function DebtScreen() {
  const { strings, formatCurrency, formatDate } = useLanguage();
  const t = strings.debt;

  const { data: debts, isPending, isError, refetch } = useDebts();
  const createDebt = useCreateDebt();

  const [tab, setTab] = useState<'owe' | 'owed'>('owe');
  const [selected, setSelected] = useState<Debt | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const list = debts ?? [];
  const youOwe = list.filter((d) => d.direction === 'owe');
  const owedToYou = list.filter((d) => d.direction === 'owed');
  const totalYouOwe = youOwe.reduce((s, d) => s + d.remaining, 0);
  const totalOwedToYou = owedToYou.reduce((s, d) => s + d.remaining, 0);
  const netBalance = totalOwedToYou - totalYouOwe;

  const currentList = tab === 'owe' ? youOwe : owedToYou;
  const numericAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const canSave = name.trim().length > 0 && numericAmount > 0 && !createDebt.isPending;

  const resetForm = () => {
    setName('');
    setPhone('');
    setAmount('');
    setSaveError(null);
  };

  const handleAdd = async () => {
    if (!canSave) return;
    try {
      await createDebt.mutateAsync({
        direction: tab,
        name: name.trim(),
        phone: phone.trim() || undefined,
        amount: numericAmount,
      });
      setShowAdd(false);
      resetForm();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : strings.common.errorTitle);
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
              <Text className="text-sm text-text-secondary">{t.netBalance}</Text>
              <Text className={`text-4xl font-bold mt-1 ${netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
              </Text>
              <View className="flex-row gap-4 mt-5 pt-5 border-t border-divider">
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <ArrowUpRight size={14} color="#4ADE80" />
                    <Text className="text-2xs text-text-secondary uppercase tracking-wider">{t.owedToYou}</Text>
                  </View>
                  <Text className="text-lg font-semibold text-success">{formatCurrency(totalOwedToYou, true)}</Text>
                </View>
                <View className="w-px bg-divider" />
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <ArrowDownRight size={14} color="#F87171" />
                    <Text className="text-2xs text-text-secondary uppercase tracking-wider">{t.youOweLabel}</Text>
                  </View>
                  <Text className="text-lg font-semibold text-danger">{formatCurrency(totalYouOwe, true)}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row bg-card rounded-2xl p-1 mt-6">
              <PressableScale
                onPress={() => setTab('owe')}
                className={`flex-1 py-3 rounded-xl items-center ${tab === 'owe' ? 'bg-danger' : ''}`}
              >
                <Text className={`text-sm font-semibold ${tab === 'owe' ? 'text-white' : 'text-text-secondary'}`}>
                  {t.tabYouOwe(youOwe.length)}
                </Text>
              </PressableScale>
              <PressableScale
                onPress={() => setTab('owed')}
                className={`flex-1 py-3 rounded-xl items-center ${tab === 'owed' ? 'bg-success' : ''}`}
              >
                <Text className={`text-sm font-semibold ${tab === 'owed' ? 'text-white' : 'text-text-secondary'}`}>
                  {t.tabOwedToYou(owedToYou.length)}
                </Text>
              </PressableScale>
            </View>

            {currentList.length === 0 ? (
              <EmptyState message={tab === 'owe' ? t.emptyOwe : t.emptyOwed} />
            ) : (
              <View className="mt-4 gap-3">
                {currentList.map((debt) => (
                  <PressableScale key={debt.id} onPress={() => setSelected(debt)} className="w-full bg-card rounded-3xl p-5">
                    <View className="flex-row items-center gap-4">
                      <View className="w-12 h-12 rounded-full bg-accent items-center justify-center shrink-0">
                        <Text className="text-lg font-bold text-bg">{debt.name[0]}</Text>
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text className="text-base font-semibold text-text-primary" numberOfLines={1}>{debt.name}</Text>
                        {debt.phone ? (
                          <View className="flex-row items-center gap-1">
                            <Phone size={11} color="#94A3B8" />
                            <Text className="text-sm text-text-secondary">{debt.phone}</Text>
                          </View>
                        ) : null}
                      </View>
                      <View className="items-end shrink-0">
                        <Text className={`text-lg font-bold ${tab === 'owe' ? 'text-danger' : 'text-success'}`}>
                          {formatCurrency(debt.remaining, true)}
                        </Text>
                        <Text className="text-2xs text-text-secondary">{t.remaining}</Text>
                      </View>
                    </View>

                    {debt.lastPayment && (
                      <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-divider">
                        <View>
                          <Text className="text-2xs text-text-secondary uppercase tracking-wider">{t.lastPayment}</Text>
                          <Text className="text-sm font-medium text-text-primary">
                            {formatCurrency(parseFloat(debt.lastPayment))} · {formatDate(debt.lastPaymentDate!)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </PressableScale>
                ))}
              </View>
            )}

            <PressableScale
              onPress={() => { resetForm(); setShowAdd(true); }}
              className="w-full mt-3 py-4 rounded-3xl border border-dashed border-divider flex-row items-center justify-center gap-2"
            >
              <Plus size={18} color="#94A3B8" />
              <Text className="text-base font-medium text-text-secondary">{tab === 'owe' ? t.addDebt : t.addLoan}</Text>
            </PressableScale>
          </View>
        )}
      </ScrollView>

      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <View className="px-5 pb-4">
            <View className="flex-row items-center gap-4 mb-6">
              <View className="w-16 h-16 rounded-full bg-accent items-center justify-center">
                <Text className="text-2xl font-bold text-bg">{selected.name[0]}</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-text-primary">{selected.name}</Text>
                {selected.phone ? (
                  <View className="flex-row items-center gap-1">
                    <Phone size={12} color="#94A3B8" />
                    <Text className="text-sm text-text-secondary">{selected.phone}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-card rounded-3xl p-5">
                <Text className="text-2xs text-text-secondary uppercase tracking-wider">{t.detailTotal}</Text>
                <Text className="text-xl font-bold text-text-primary mt-1">{formatCurrency(selected.amount)}</Text>
              </View>
              <View className="flex-1 bg-card rounded-3xl p-5">
                <Text className="text-2xs text-text-secondary uppercase tracking-wider">{t.detailRemaining}</Text>
                <Text className={`text-xl font-bold mt-1 ${selected.direction === 'owe' ? 'text-danger' : 'text-success'}`}>
                  {formatCurrency(selected.remaining)}
                </Text>
              </View>
            </View>

            <View>
              <View className="flex-row items-center gap-2 mb-3">
                <History size={16} color="#94A3B8" />
                <Text className="text-base font-semibold text-text-primary">{t.paymentHistory}</Text>
              </View>
              {selected.history.length > 0 ? (
                <View className="gap-2">
                  {selected.history.map((h, i) => (
                    <View key={i} className="flex-row items-center justify-between py-3 px-4 rounded-2xl bg-card">
                      <View className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-full bg-accent/10 items-center justify-center">
                          {selected.direction === 'owe' ? <ArrowUpRight size={14} color="#F87171" /> : <ArrowDownRight size={14} color="#4ADE80" />}
                        </View>
                        <Text className="text-sm text-text-secondary">{formatDate(h.date)}</Text>
                      </View>
                      <Text className={`text-sm font-semibold ${selected.direction === 'owe' ? 'text-danger' : 'text-success'}`}>
                        {selected.direction === 'owe' ? '−' : '+'}{formatCurrency(h.amount)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-sm text-text-secondary text-center py-6">{t.noPayments}</Text>
              )}
            </View>

            {/* "Remind" and "Add Payment" intentionally omitted until they do
                something — Play rejects apps for non-functional controls. */}
          </View>
        )}
      </Sheet>

      <Sheet open={showAdd} onClose={() => setShowAdd(false)} title={tab === 'owe' ? t.formTitleDebt : t.formTitleLoan}>
        <View className="px-5 pb-4 gap-4">
          <View>
            <Text className="text-sm text-text-secondary mb-2">{t.name}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t.namePlaceholder}
              placeholderTextColor="#4B5563"
              className="bg-card rounded-2xl px-4 py-3.5 text-base text-text-primary"
            />
          </View>
          <View>
            <Text className="text-sm text-text-secondary mb-2">{t.phone} <Text className="text-text-muted">{t.phoneOptional}</Text></Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder={t.phonePlaceholder}
              placeholderTextColor="#4B5563"
              keyboardType="phone-pad"
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
          {saveError && <Text className="text-sm text-danger">{saveError}</Text>}
          <PressableScale
            onPress={handleAdd}
            disabled={!canSave}
            className={`w-full py-4 rounded-2xl bg-accent items-center mt-2 ${!canSave ? 'opacity-30' : ''}`}
          >
            <Text className="text-bg text-base font-bold">
              {createDebt.isPending ? strings.common.saving : tab === 'owe' ? t.saveDebt : t.saveLoan}
            </Text>
          </PressableScale>
        </View>
      </Sheet>
    </View>
  );
}

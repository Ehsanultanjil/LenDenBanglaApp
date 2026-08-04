import { toBanglaDigits } from './numerals';

export interface AppStrings {
  nav: { debt: string; goals: string; payments: string; profile: string };
  common: {
    loading: string;
    errorTitle: string;
    retry: string;
    saving: string;
    cancel: string;
    offline: string;
    today: string;
    yesterday: string;
    daysAgo: (n: number) => string;
  };
  auth: {
    tagline: string;
    signInWithGoogle: string;
    signingIn: string;
    signInFailed: string;
    notConfigured: string;
  };
  debt: {
    title: string;
    subtitle: string;
    netBalance: string;
    owedToYou: string;
    youOweLabel: string;
    tabYouOwe: (n: number) => string;
    tabOwedToYou: (n: number) => string;
    remaining: string;
    lastPayment: string;
    addDebt: string;
    addLoan: string;
    detailTotal: string;
    detailRemaining: string;
    paymentHistory: string;
    noPayments: string;
    remind: string;
    addPayment: string;
    formTitleDebt: string;
    formTitleLoan: string;
    name: string;
    namePlaceholder: string;
    phone: string;
    phoneOptional: string;
    phonePlaceholder: string;
    amount: string;
    saveDebt: string;
    saveLoan: string;
    emptyOwe: string;
    emptyOwed: string;
  };
  goals: {
    title: string;
    subtitle: string;
    totalSaved: string;
    of: string;
    complete: string;
    remaining: string;
    monthly: string;
    deadline: string;
    addMoney: string;
    createNewGoal: string;
    addMoneyTo: (name: string) => string;
    add: string;
    empty: string;
    formTitle: string;
    goalName: string;
    goalNamePlaceholder: string;
    targetAmount: string;
    monthlyOptional: string;
    pickIcon: string;
    pickColor: string;
    save: string;
  };
  bills: {
    title: string;
    subtitle: string;
    upcoming: string;
    overdue: string;
    paid: string;
    all: string;
    billsCount: (n: number) => string;
    dueToday: string;
    dueInDays: (n: number) => string;
    daysAgo: (n: number) => string;
    daysOverdue: (n: number) => string;
    recurring: string;
    payNow: string;
    addBill: string;
    empty: string;
    formTitle: string;
    billName: string;
    billNamePlaceholder: string;
    category: string;
    categoryPlaceholder: string;
    amount: string;
    dueDate: string;
    isRecurring: string;
    pickIcon: string;
    pickColor: string;
    save: string;
  };
  profile: {
    title: string;
    debts: string;
    goals: string;
    dueSoon: string;
    notifications: string;
    notificationsSubtitle: string;
    language: string;
    languageSubtitle: string;
    privacySecurity: string;
    helpSupport: string;
    logOut: string;
    logOutConfirmTitle: string;
    logOutConfirmBody: string;
    cancel: string;
    loggedOut: string;
    footer: string;
    logOutFailed: string;
    deleteAccount: string;
    deleteAccountSubtitle: string;
    deleteConfirmTitle: string;
    deleteConfirmBody: string;
    deleteConfirmAction: string;
    deleted: string;
    deleteFailed: string;
  };
}

export const translations: Record<'en' | 'bn', AppStrings> = {
  en: {
    nav: { debt: 'Debt', goals: 'Goals', payments: 'Payments', profile: 'Profile' },
    common: {
      loading: 'Loading…',
      errorTitle: 'Something went wrong',
      retry: 'Try again',
      saving: 'Saving…',
      cancel: 'Cancel',
      offline: "You're offline",
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: (n: number) => `${n} days ago`,
    },
    auth: {
      tagline: 'Track debts, savings and monthly payments.',
      signInWithGoogle: 'Continue with Google',
      signingIn: 'Signing in…',
      signInFailed: 'Sign-in failed. Please try again.',
      notConfigured:
        'Google Sign-In is not configured yet. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file.',
    },
    debt: {
      title: 'Debt',
      subtitle: 'Track who owes you',
      netBalance: 'Net Balance',
      owedToYou: 'Owed to you',
      youOweLabel: 'You owe',
      tabYouOwe: (n: number) => `You Owe (${n})`,
      tabOwedToYou: (n: number) => `Owed To You (${n})`,
      remaining: 'remaining',
      lastPayment: 'Last payment',
      addDebt: 'Add debt',
      addLoan: 'Add loan',
      detailTotal: 'Total',
      detailRemaining: 'Remaining',
      paymentHistory: 'Payment History',
      noPayments: 'No payments yet',
      remind: 'Remind',
      addPayment: 'Add Payment',
      formTitleDebt: 'Add Debt',
      formTitleLoan: 'Add Loan',
      name: 'Name',
      namePlaceholder: "Person's name",
      phone: 'Phone',
      phoneOptional: '(optional)',
      phonePlaceholder: '+880 1XXX XXXXXX',
      amount: 'Amount',
      saveDebt: 'Save Debt',
      saveLoan: 'Save Loan',
      emptyOwe: "You don't owe anyone yet.",
      emptyOwed: 'Nobody owes you yet.',
    },
    goals: {
      title: 'Goals',
      subtitle: 'Save for what matters',
      totalSaved: 'Total Saved',
      of: 'of',
      complete: 'complete',
      remaining: 'Remaining',
      monthly: 'Monthly',
      deadline: 'Deadline',
      addMoney: 'Add money',
      createNewGoal: 'Create new goal',
      addMoneyTo: (name: string) => `Add money to ${name}`,
      add: 'Add',
      empty: 'No goals yet. Create one to start saving.',
      formTitle: 'New Goal',
      goalName: 'Goal name',
      goalNamePlaceholder: 'MacBook Pro',
      targetAmount: 'Target amount',
      monthlyOptional: 'Monthly contribution (optional)',
      pickIcon: 'Icon',
      pickColor: 'Colour',
      save: 'Create Goal',
    },
    bills: {
      title: 'Monthly Payments',
      subtitle: "Stay on top of what's due",
      upcoming: 'Upcoming',
      overdue: 'Overdue',
      paid: 'Paid',
      all: 'all',
      billsCount: (n: number) => `${n} bills`,
      dueToday: 'Due today',
      dueInDays: (n: number) => `Due in ${n} days`,
      daysAgo: (n: number) => `${n} days ago`,
      daysOverdue: (n: number) => `${n} days overdue`,
      recurring: 'Recurring',
      payNow: 'Pay now',
      addBill: 'Add bill',
      empty: 'No payments tracked yet. Add your first bill.',
      formTitle: 'New Payment',
      billName: 'Name',
      billNamePlaceholder: 'Electricity bill',
      category: 'Category',
      categoryPlaceholder: 'Utility',
      amount: 'Amount',
      dueDate: 'Due date',
      isRecurring: 'Repeats monthly',
      pickIcon: 'Icon',
      pickColor: 'Colour',
      save: 'Add Payment',
    },
    profile: {
      title: 'Profile',
      debts: 'Debts',
      goals: 'Goals',
      dueSoon: 'Due Soon',
      notifications: 'Notifications',
      notificationsSubtitle: 'Reminders for bills & goals',
      language: 'Language',
      languageSubtitle: 'App display language',
      privacySecurity: 'Privacy & Security',
      helpSupport: 'Help & Support',
      logOut: 'Log Out',
      logOutConfirmTitle: 'Log out?',
      logOutConfirmBody: 'You can log back in anytime.',
      cancel: 'Cancel',
      loggedOut: 'Logged out',
      footer: 'LenDen Bangla v1.0.0 · Made in Bangladesh',
      logOutFailed: 'Could not log out. Please try again.',
      deleteAccount: 'Delete Account',
      deleteAccountSubtitle: 'Permanently erase your account and all data',
      deleteConfirmTitle: 'Delete your account?',
      deleteConfirmBody:
        'This permanently deletes your account and every debt, goal and payment you have saved. This cannot be undone.',
      deleteConfirmAction: 'Delete Forever',
      deleted: 'Your account has been deleted.',
      deleteFailed: 'Could not delete your account. Please try again.',
    },
  },
  bn: {
    nav: { debt: 'দেনা', goals: 'লক্ষ্য', payments: 'পেমেন্ট', profile: 'প্রোফাইল' },
    common: {
      loading: 'লোড হচ্ছে…',
      errorTitle: 'কিছু একটা সমস্যা হয়েছে',
      retry: 'আবার চেষ্টা করুন',
      saving: 'সংরক্ষণ হচ্ছে…',
      cancel: 'বাতিল',
      offline: 'আপনি অফলাইনে আছেন',
      today: 'আজ',
      yesterday: 'গতকাল',
      daysAgo: (n: number) => `${toBanglaDigits(n)} দিন আগে`,
    },
    auth: {
      tagline: 'দেনা, সঞ্চয় ও মাসিক পেমেন্ট এক জায়গায়।',
      signInWithGoogle: 'Google দিয়ে চালিয়ে যান',
      signingIn: 'সাইন ইন হচ্ছে…',
      signInFailed: 'সাইন ইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
      notConfigured:
        'Google Sign-In এখনো কনফিগার করা হয়নি। .env ফাইলে EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID যোগ করুন।',
    },
    debt: {
      title: 'দেনা',
      subtitle: 'কে কার কাছে পাবেন তা দেখুন',
      netBalance: 'নিট ব্যালেন্স',
      owedToYou: 'আপনি পাবেন',
      youOweLabel: 'আপনি দেনাদার',
      tabYouOwe: (n: number) => `আপনি দেবেন (${toBanglaDigits(n)})`,
      tabOwedToYou: (n: number) => `আপনি পাবেন (${toBanglaDigits(n)})`,
      remaining: 'বাকি',
      lastPayment: 'সর্বশেষ পরিশোধ',
      addDebt: 'দেনা যোগ করুন',
      addLoan: 'ঋণ যোগ করুন',
      detailTotal: 'মোট',
      detailRemaining: 'বাকি',
      paymentHistory: 'পরিশোধের ইতিহাস',
      noPayments: 'এখনো কোনো পরিশোধ হয়নি',
      remind: 'মনে করিয়ে দিন',
      addPayment: 'পরিশোধ যোগ করুন',
      formTitleDebt: 'দেনা যোগ করুন',
      formTitleLoan: 'ঋণ যোগ করুন',
      name: 'নাম',
      namePlaceholder: 'ব্যক্তির নাম',
      phone: 'ফোন',
      phoneOptional: '(ঐচ্ছিক)',
      phonePlaceholder: '+৮৮০ ১XXX XXXXXX',
      amount: 'পরিমাণ',
      saveDebt: 'দেনা সংরক্ষণ করুন',
      saveLoan: 'ঋণ সংরক্ষণ করুন',
      emptyOwe: 'আপনি এখনো কারো কাছে দেনাদার নন।',
      emptyOwed: 'এখনো কেউ আপনার কাছে দেনাদার নয়।',
    },
    goals: {
      title: 'লক্ষ্য',
      subtitle: 'যা গুরুত্বপূর্ণ তার জন্য সঞ্চয় করুন',
      totalSaved: 'মোট সঞ্চয়',
      of: 'এর মধ্যে',
      complete: 'সম্পন্ন',
      remaining: 'বাকি',
      monthly: 'মাসিক',
      deadline: 'শেষ তারিখ',
      addMoney: 'টাকা যোগ করুন',
      createNewGoal: 'নতুন লক্ষ্য তৈরি করুন',
      addMoneyTo: (name: string) => `${name}-এ টাকা যোগ করুন`,
      add: 'যোগ করুন',
      empty: 'এখনো কোনো লক্ষ্য নেই। সঞ্চয় শুরু করতে একটি তৈরি করুন।',
      formTitle: 'নতুন লক্ষ্য',
      goalName: 'লক্ষ্যের নাম',
      goalNamePlaceholder: 'ম্যাকবুক প্রো',
      targetAmount: 'লক্ষ্যমাত্রা',
      monthlyOptional: 'মাসিক জমা (ঐচ্ছিক)',
      pickIcon: 'আইকন',
      pickColor: 'রঙ',
      save: 'লক্ষ্য তৈরি করুন',
    },
    bills: {
      title: 'মাসিক পেমেন্ট',
      subtitle: 'কী বাকি আছে তা নজরে রাখুন',
      upcoming: 'আসন্ন',
      overdue: 'বকেয়া',
      paid: 'পরিশোধিত',
      all: 'সব',
      billsCount: (n: number) => `${toBanglaDigits(n)}টি বিল`,
      dueToday: 'আজ পরিশোধ্য',
      dueInDays: (n: number) => `${toBanglaDigits(n)} দিনে পরিশোধ্য`,
      daysAgo: (n: number) => `${toBanglaDigits(n)} দিন আগে`,
      daysOverdue: (n: number) => `${toBanglaDigits(n)} দিন বকেয়া`,
      recurring: 'পুনরাবৃত্ত',
      payNow: 'এখনই পরিশোধ করুন',
      addBill: 'বিল যোগ করুন',
      empty: 'এখনো কোনো পেমেন্ট নেই। প্রথম বিলটি যোগ করুন।',
      formTitle: 'নতুন পেমেন্ট',
      billName: 'নাম',
      billNamePlaceholder: 'বিদ্যুৎ বিল',
      category: 'ধরন',
      categoryPlaceholder: 'ইউটিলিটি',
      amount: 'পরিমাণ',
      dueDate: 'শেষ তারিখ',
      isRecurring: 'প্রতি মাসে পুনরাবৃত্তি',
      pickIcon: 'আইকন',
      pickColor: 'রঙ',
      save: 'পেমেন্ট যোগ করুন',
    },
    profile: {
      title: 'প্রোফাইল',
      debts: 'দেনা',
      goals: 'লক্ষ্য',
      dueSoon: 'শীঘ্রই বাকি',
      notifications: 'নোটিফিকেশন',
      notificationsSubtitle: 'বিল ও লক্ষ্যের জন্য রিমাইন্ডার',
      language: 'ভাষা',
      languageSubtitle: 'অ্যাপের ভাষা',
      privacySecurity: 'গোপনীয়তা ও নিরাপত্তা',
      helpSupport: 'সহায়তা',
      logOut: 'লগ আউট',
      logOutConfirmTitle: 'লগ আউট করবেন?',
      logOutConfirmBody: 'আপনি যেকোনো সময় আবার লগ ইন করতে পারবেন।',
      cancel: 'বাতিল',
      loggedOut: 'লগ আউট হয়েছে',
      footer: 'লেনদেন বাংলা v১.০.০ · বাংলাদেশে তৈরি',
      logOutFailed: 'লগ আউট করা যায়নি। আবার চেষ্টা করুন।',
      deleteAccount: 'অ্যাকাউন্ট মুছুন',
      deleteAccountSubtitle: 'আপনার অ্যাকাউন্ট ও সব তথ্য স্থায়ীভাবে মুছে যাবে',
      deleteConfirmTitle: 'অ্যাকাউন্ট মুছে ফেলবেন?',
      deleteConfirmBody:
        'এতে আপনার অ্যাকাউন্ট এবং সংরক্ষিত সব দেনা, লক্ষ্য ও পেমেন্ট স্থায়ীভাবে মুছে যাবে। এটি আর ফেরানো যাবে না।',
      deleteConfirmAction: 'স্থায়ীভাবে মুছুন',
      deleted: 'আপনার অ্যাকাউন্ট মুছে ফেলা হয়েছে।',
      deleteFailed: 'অ্যাকাউন্ট মোছা যায়নি। আবার চেষ্টা করুন।',
    },
  },
};

export type Language = keyof typeof translations;
export type Strings = AppStrings;

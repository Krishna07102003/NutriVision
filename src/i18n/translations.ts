export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // Header
    appName: 'NutriVision',
    signOut: 'Sign out',
    weightLabel: 'Weight',
    heightLabel: 'Height',
    goalLabel: 'Goal',
    dietLabel: 'Diet',

    // Loading
    loading: 'Loading…',

    // Onboarding
    onboardingTitle1: 'A little about you.',
    onboardingDesc1: 'This helps us calculate your daily targets.',
    nameLabel: 'Name',
    namePlaceholder: 'Your name',
    weightPlaceholder: '70',
    heightPlaceholder: '170',
    ageLabel: 'Age',
    agePlaceholder: '28',
    genderLabel: 'Gender',
    male: 'Male',
    female: 'Female',
    ageDisclaimer: 'Age and gender are used only for the BMR calculation (Mifflin-St Jeor formula) — never shown or shared.',
    continue: 'Continue',
    onboardingTitle2: 'What\'s your goal?',
    onboardingDesc2: 'We\'ll personalize your targets.',
    activityLabel: 'How active are you?',
    onboardingTitle3: 'Diet preference',
    onboardingDesc3: 'Any restrictions we should know about?',
    back: 'Back',
    finish: 'Finish',

    // Dashboard
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    logMeal: 'Log a meal',
    analyzing: 'Analyzing…',
    askCoach: 'Ask your coach',
    mealPlan: '3-day meal plan',
    regeneratePlan: 'Regenerate plan',
    buildingPlan: 'Building plan...',
    myRecipes: 'My Recipes',
    noRecipes: 'No recipes yet. Create one to log meals faster!',
    saveRecipe: 'Save Recipe',
    recipeName: 'Recipe name (e.g. My Breakfast)',
    searchFoodToAdd: 'Search food to add...',
    nothingLoggedToday: 'Nothing logged yet today.',
    noEntriesForDay: 'No entries for this day.',
    mealLogged: 'Meal logged',
    resetConfirm: "Reset today's entries?",

    // Date
    goToToday: 'Go to today',

    // Water
    water: 'Water',
    glasses: 'glasses',

    // Weight
    weight: 'Weight',
    logWeight: 'Log your weight (kg)',
    last: 'Last',
    viewHistory: 'View history',
    entries: 'entries',
    hideHistory: 'Hide history',

    // Food Search
    searchFood: 'Search food (e.g. roti, banana, paneer)',
    noFoodsFound: 'No foods found',
    addManuallyInstead: 'Add manually instead',
    cantFind: "Can't find it? Add manually",

    // Manual Entry
    addFoodManually: 'Add food manually',
    foodName: 'Food name',
    foodNamePlaceholder: 'e.g. 2 Roti with Dal',
    serving: 'Serving',
    servingPlaceholder: 'e.g. 1 plate, 1 bowl',
    addToToday: 'Add to today',
    caloriesLabel: 'Calories',
    proteinLabel: 'Protein (g)',
    carbsLabel: 'Carbs (g)',
    fatLabel: 'Fat (g)',

    // Quick Add
    favorites: 'Favorites',
    recent: 'Recent',
    addToFavorites: 'Add to favorites',

    // Analytics
    progress: 'Progress',
    avgCalories: 'Avg Calories',
    avgProtein: 'Avg Protein',
    daysLogged: 'Days Logged',
    proteinStreak: 'Protein Streak',
    consecutive: 'consecutive',
    days7: '7 days',
    days30: '30 days',

    // Coach
    typeMessage: 'Type your message...',
    sending: 'Sending...',
    generateInsight: 'Generate daily insight',

    // Auth
    getStarted: 'Get Started',
    noAccountNeeded: 'No account needed',
    continueWithGoogle: 'Continue with Google',
    continueWithEmail: 'Continue with Email',
    continueWithPhone: 'Continue with Phone',
    orDivider: 'or',
    backToOptions: '← Back',
    enterEmail: 'Enter your email',
    enterPhone: 'Enter your phone number',
    sendCode: 'Send code',
    enterOtp: 'Enter the code we sent to',
    verifyAndSignIn: 'Verify & sign in',
    resendCode: 'Resend code',
    invalidOtp: 'Invalid code. Please try again.',

    // Diet Plan
    day: 'Day',

    // Export
    export: 'Export',
    mealsOnly: 'Meals only',
    weightOnly: 'Weight only',
    exportAll: 'Export all',

    // Disclaimer
    disclaimerTitle: 'Medical Disclaimer',
    disclaimerText: 'NutriVision provides AI-generated nutrition estimates for informational purposes only. Always consult a healthcare professional or registered dietitian before making significant dietary changes.',

    // Theme
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
  },
  hi: {
    // Header
    appName: 'NutriVision',
    signOut: 'साइन आउट',
    weightLabel: 'वज़न',
    heightLabel: 'ऊंचाई',
    goalLabel: 'लक्ष्य',
    dietLabel: 'आहार',

    // Loading
    loading: 'लोड हो रहा है…',

    // Onboarding
    onboardingTitle1: 'आपके बारे में थोड़ा।',
    onboardingDesc1: 'इससे हम आपके दैनिक लक्ष्यों की गणना कर सकते हैं।',
    nameLabel: 'नाम',
    namePlaceholder: 'आपका नाम',
    weightPlaceholder: '70',
    heightPlaceholder: '170',
    ageLabel: 'उम्र',
    agePlaceholder: '28',
    genderLabel: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    ageDisclaimer: 'उम्र और लिंग केवल BMR गणना (Mifflin-St Jeor सूत्र) के लिए उपयोग किए जाते हैं — कभी नहीं दिखाया या साझा किया जाता।',
    continue: 'आगे बढ़ें',
    onboardingTitle2: 'आपका लक्ष्य क्या है?',
    onboardingDesc2: 'हम आपके लक्ष्यों को अनुकूलित करेंगे।',
    activityLabel: 'आप कितने सक्रिय हैं?',
    onboardingTitle3: 'आहार प्राथमिकता',
    onboardingDesc3: 'कोई प्रतिबंध जिसके बारे में हमें पता होना चाहिए?',
    back: 'वापस',
    finish: 'समाप्त',

    // Dashboard
    calories: 'कैलोरी',
    protein: 'प्रोटीन',
    carbs: 'कार्ब्स',
    fat: 'वसा',
    logMeal: 'भोजन दर्ज करें',
    analyzing: 'विश्लेषण हो रहा है…',
    askCoach: 'कोच से पूछें',
    mealPlan: '3-दिन का भोजन योजना',
    regeneratePlan: 'योजना फिर से बनाएं',
    buildingPlan: 'योजना बन रही है...',
    myRecipes: 'मेरी रेसिपी',
    noRecipes: 'अभी तक कोई रेसिपी नहीं। भोजन तेज़ी से दर्ज करने के लिए एक बनाएं!',
    saveRecipe: 'रेसिपी सहेजें',
    recipeName: 'रेसिपी का नाम (जैसे मेरा नाश्ता)',
    searchFoodToAdd: 'भोजन खोजें...',
    nothingLoggedToday: 'आज अभी तक कुछ दर्ज नहीं हुआ।',
    noEntriesForDay: 'इस दिन के लिए कोई एंट्री नहीं।',
    mealLogged: 'भोजन दर्ज हुआ',
    resetConfirm: 'आज की एंट्री रीसेट करें?',

    // Date
    goToToday: 'आज पर जाएं',

    // Water
    water: 'पानी',
    glasses: 'गिलास',

    // Weight
    weight: 'वज़न',
    logWeight: 'अपना वज़न दर्ज करें (किलो)',
    last: 'पिछला',
    viewHistory: 'इतिहास देखें',
    entries: 'एंट्री',
    hideHistory: 'इतिहास छुपाएं',

    // Food Search
    searchFood: 'भोजन खोजें (जैसे रोटी, केला, पनीर)',
    noFoodsFound: 'कोई भोजन नहीं मिला',
    addManuallyInstead: 'मैनुअली जोड़ें',
    cantFind: 'नहीं मिल रहा? मैनुअली जोड़ें',

    // Manual Entry
    addFoodManually: 'भोजन मैनुअली जोड़ें',
    foodName: 'भोजन का नाम',
    foodNamePlaceholder: 'जैसे 2 रोटी दाल के साथ',
    serving: 'सर्विंग',
    servingPlaceholder: 'जैसे 1 प्लेट, 1 कटोरी',
    addToToday: 'आज जोड़ें',
    caloriesLabel: 'कैलोरी',
    proteinLabel: 'प्रोटीन (g)',
    carbsLabel: 'कार्ब्स (g)',
    fatLabel: 'वसा (g)',

    // Quick Add
    favorites: 'पसंदीदा',
    recent: 'हाल का',
    addToFavorites: 'पसंदीदा में जोड़ें',

    // Analytics
    progress: 'प्रगति',
    avgCalories: 'औसत कैलोरी',
    avgProtein: 'औसत प्रोटीन',
    daysLogged: 'दर्ज दिन',
    proteinStreak: 'प्रोटीन स्ट्रीक',
    consecutive: 'लगातार',
    days7: '7 दिन',
    days30: '30 दिन',

    // Coach
    typeMessage: 'अपना संदेश टाइप करें...',
    sending: 'भेज रहे हैं...',
    generateInsight: 'दैनिक अंतर्दृष्टि बनाएं',

    // Auth
    getStarted: 'शुरू करें',
    noAccountNeeded: 'खाते की ज़रूरत नहीं',
    continueWithGoogle: 'Google से जारी रखें',
    continueWithEmail: 'ईमेल से जारी रखें',
    continueWithPhone: 'फ़ोन से जारी रखें',
    orDivider: 'या',
    backToOptions: '← वापस',
    enterEmail: 'अपना ईमेल दर्ज करें',
    enterPhone: 'अपना फ़ोन नंबर दर्ज करें',
    sendCode: 'कोड भेजें',
    enterOtp: 'हमने यहां भेजा कोड दर्ज करें',
    verifyAndSignIn: 'सत्यापित करें और साइन इन करें',
    resendCode: 'कोड फिर से भेजें',
    invalidOtp: 'गलत कोड। कृपया फिर से कोशिश करें।',

    // Diet Plan
    day: 'दिन',

    // Export
    export: 'एक्सपोर्ट',
    mealsOnly: 'केवल भोजन',
    weightOnly: 'केवल वज़न',
    exportAll: 'सब एक्सपोर्ट',

    // Disclaimer
    disclaimerTitle: 'चिकित्सा अस्वीकरण',
    disclaimerText: 'NutriVision केवल सूचना उद्देश्यों के लिए AI-जनित पोषण अनुमान प्रदान करता है। महत्वपूर्ण आहार परिवर्तनों से पहले हमेशा एक स्वास्थ्य पेशेवर या पंजीकृत आहार विशेषज्ञ से परामर्श करें।',

    // Theme
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

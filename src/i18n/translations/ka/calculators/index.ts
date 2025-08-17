import common from './common';
import cardiology from './cardiology';
import eurscoreII from './euroscore-ii';
import hcmRiskSCD from './hcm-risk-scd';
import hcmAFRisk from './hcm-af-risk';
import heartFailureStagingTranslations from './heart-failure-staging';
import gwtgHfRiskTranslations from './gwtg-hf-risk';
import { 
  ovarianReserveCalculator,
  gestationalAgeCalculator,
  eddCalculator,
  preeclampsiaRiskCalculator,
  pretermBirthRiskCalculator,
  gdmScreeningCalculator,
  bishopScoreCalculator,
  vbacSuccessCalculator,
  apgarScoreCalculator,
  pphRiskCalculator,
  cervicalCancerRiskCalculator,
  ovarianCancerRiskCalculator,
  endometrialCancerRiskCalculator,
  menopauseAssessmentCalculator
} from './ObGyn';

export default {
  common,
  cardiology,
  eurscoreII,
  
  // OB/GYN namespace - this is what makes t('calculators.obgyn.apgar_score.title') work
  obgyn: {
    apgar_score: apgarScoreCalculator,
    bishop_score: bishopScoreCalculator,
    cervical_cancer_risk: cervicalCancerRiskCalculator,
    edd_calculator: eddCalculator,
    endometrial_cancer_risk: endometrialCancerRiskCalculator,
    gdm_screening: gdmScreeningCalculator,
    gestational_age: gestationalAgeCalculator,
    menopause_assessment: menopauseAssessmentCalculator,
    ovarian_cancer_risk: ovarianCancerRiskCalculator,
    ovarian_reserve: ovarianReserveCalculator,
    ovarian_reserve_calculator: ovarianReserveCalculator,
    pph_risk: pphRiskCalculator,
    preeclampsia_risk: preeclampsiaRiskCalculator,
    preterm_birth_risk: pretermBirthRiskCalculator,
    vbac_success: vbacSuccessCalculator
  },
  
  // Direct access ObGyn namespace for the useTranslation hook
  ObGyn: {
    ovarianReserve: ovarianReserveCalculator,
    ovarianReserveCalculator: ovarianReserveCalculator,
    gestationalAgeCalculator: gestationalAgeCalculator,
    eddCalculator: eddCalculator,
    preeclampsiaRiskCalculator: preeclampsiaRiskCalculator,
    pretermBirthRiskCalculator: pretermBirthRiskCalculator,
    gdmScreeningCalculator: gdmScreeningCalculator,
    bishopScoreCalculator: bishopScoreCalculator,
    vbacSuccessCalculator: vbacSuccessCalculator,
    apgarScoreCalculator: apgarScoreCalculator,
    pphRiskCalculator: pphRiskCalculator,
    cervicalCancerRiskCalculator: cervicalCancerRiskCalculator,
    ovarianCancerRiskCalculator: ovarianCancerRiskCalculator,
    endometrialCancerRiskCalculator: endometrialCancerRiskCalculator,
    menopauseAssessmentCalculator: menopauseAssessmentCalculator
  },
  
  // Individual OB/GYN calculators with direct access (for backward compatibility)
  gestational_age: gestationalAgeCalculator,
  edd: eddCalculator,
  preeclampsia_risk: preeclampsiaRiskCalculator,
  preterm_birth_risk: pretermBirthRiskCalculator,
  gdm_screening: gdmScreeningCalculator,
  bishop_score: bishopScoreCalculator,
  vbac_success: vbacSuccessCalculator,
  apgar_score: apgarScoreCalculator,
  pph_risk_calculator: pphRiskCalculator,
  
  // Top-level keys for Calculator landing page
  specialty: {
    cardiology: {
      title: 'კარდიოლოგიის კალკულატორები',
      description: 'პროფესიონალური გულ-სისხლძარღვთა რისკის შეფასება და კლინიკური გადაწყვეტილების მხარდაჭერის ინსტრუმენტები',
      status: 'PRODUCTION READY', 
      message: '✅ 16 კალკულატორი • 100% ვალიდირებული • 6 კატეგორია'
    },
    obgyn: {
      title: 'OB/GYN კალკულატორები',
      description: 'კომპლექსური აკუშერობისა და გინეკოლოგიის შეფასების ინსტრუმენტები',
      status: 'IMPLEMENTATION READY',
      message: '⚠️ 14 კალკულატორი • იმპლემენტაციის ფაზა • პროფესიონალური კლასი'
    }
  },
  
  stats: {
    calculators: 'კალკულატორები',
    validated: 'ვალიდირებული', 
    categories: 'კატეგორიები'
  },
  
  categories: {
    risk_assessment: 'რისკის შეფასება',
    acute_care: 'მწვავე მოვლა',
    therapy_management: 'თერაპიის მენეჯმენტი',
    heart_failure: 'გულის უკმარისობა',
    surgical_risk: 'ქირურგიული რისკი',
    cardiomyopathy: 'კარდიომიოპათია',
    pregnancy_dating: 'ორსულობის ვადა',
    antenatal_risk: 'ანტენატალური რისკი',
    labor_management: 'მშობიარობის მენეჯმენტი',
    assessment_tools: 'შეფასების ხელსაწყოები',
    gynecologic_oncology: 'გინეკოლოგიური ონკოლოგია',
    reproductive_endocrinology: 'რეპროდუქციული ენდოკრინოლოგია'
  },
  
  // Calculator title/subtitle shortcuts for cards
  dapt: {
    title: 'DAPT Score კალკულატორი',
    subtitle: 'ორმაგი ანტითრომბოციტული თერაპიის ხანგრძლივობა • სარგებლობა-რისკის შეფასება'
  },
  
  precise_dapt: {
    title: 'PRECISE-DAPT კალკულატორი',
    subtitle: 'სისხლდენის რისკის შეფასება • DAPT ხანგრძლივობის ოპტიმიზაცია'
  },
  
  prevent: {
    title: 'AHA PREVENT™ კალკულატორი',
    subtitle: 'გულ-სისხლძარღვთა რისკის შეფასება • CKM-E გაძლიერებული'
  },
  
  ascvd: {
    title: 'ASCVD რისკის კალკულატორი',
    subtitle: '10-წლიანი ათეროსკლეროზული გულ-სისხლძარღვთა დაავადების რისკი'
  },
  
  atrial_fibrillation: {
    title: 'წინაგულების ფიბრილაციის კალკულატორები',
    subtitle: 'CHA₂DS₂-VASc • HAS-BLED • ყოვლისმომცველი ფიბრილაციის შეფასება'
  },
  
  timi_risk: {
    title: 'TIMI რისკის კალკულატორი',
    subtitle: 'მიოკარდის ინფარქტში თრომბოლიზისის რისკის შეფასება'
  },
  
  grace_acs: {
    title: 'GRACE ACS კალკულატორი',
    subtitle: 'მწვავე კორონარული მოვლენების გლობალური რეგისტრი - რისკის შეფასება'
  },
  
  heart_failure_staging: {
    title: 'გულის უკმარისობის სტადიები',
    subtitle: 'ACC/AHA სტადიების კლასიფიკაცია • კლინიკური შეფასება'
  },
  
  gwtg_hf: {
    title: 'GWTG-HF კალკულატორი',
    subtitle: 'გიდლაინებთან შესაბამისობა - გულის უკმარისობის რისკის ქულა'
  },
  
  maggic: {
    title: 'MAGGIC კალკულატორი',
    subtitle: 'ქრონიკული გულის უკმარისობის გლობალური ჯგუფის მეტა-ანალიზი'
  },
  
  shfm: {
    title: 'SHFM კალკულატორი',
    subtitle: 'სიეტლის გულის უკმარისობის მოდელი • სიცოცხლიანობის  პროგნოზი'
  },
  
  sts: {
    title: 'STS კალკულატორი',
    subtitle: 'თორაკალური ქირურგების საზოგადოება - რისკის შეფასება'
  },
  
  euroscore: {
    title: 'EuroSCORE II კალკულატორი',
    subtitle: 'ევროპული გულის ოპერაციული რისკის შეფასების სისტემა'
  },
  
  hcm_risk_scd: hcmRiskSCD,
  
  hcmAFRisk,
  hcm_af_risk: hcmAFRisk,
  
  categories_label: 'კატეგორიები',
  calculator_categories: 'კალკულატორის კატეგორიები',
  back_to: 'უკან',
  view_grid: 'ბადე',
  view_list: 'სია',
  
  // OB/GYN Calculator entries
  pph_risk: {
    title: 'PPH რისკის კალკულატორი',
    subtitle: 'მშობიარობის შემდგომი სისხლდენის რისკის შეფასება'
  },
  
  cervical_cancer_risk: {
    title: 'საშვილოსნოს ყელის კიბოს რისკის კალკულატორი',
    subtitle: 'HPV-ზე დაფუძნებული საშვილოსნოს ყელის კიბოს რისკის შეფასება'
  },
  
  ovarian_cancer_risk: {
    title: 'საკვერცხეების კიბოს რისკის კალკულატორი',
    subtitle: 'მემკვიდრეობითი საკვერცხეების კიბოს რისკის შეფასება'
  },
  
  endometrial_cancer_risk: {
    title: 'ენდომეტრიუმის კიბოს რისკის კალკულატორი',
    subtitle: 'ენდომეტრიუმის კიბოს სიცოცხლისგან რისკის შეფასება'
  },
  
  ovarian_reserve: {
    title: 'საკვერცხეების რეზერვის კალკულატორი',
    subtitle: 'AMH-ზე დაფუძნებული ნაყოფიერების შეფასება'
  },
  
  menopause_assessment: menopauseAssessmentCalculator,
  
  // Heart Failure Staging Calculator - top-level access
  heartFailureStaging: heartFailureStagingTranslations,
  
  // GWTG-HF Risk Calculator - top-level access
  gwtgHfRisk: gwtgHfRiskTranslations
};

export {
  eurscoreII
}; 
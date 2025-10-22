import maggicTranslations from './maggic';
import riskAssessmentTranslations from './risk-assessment';
import { timiRiskScoreTranslations } from './timi-risk-score';
import { grace2Translations } from './grace-2';
import daptTranslations from './dapt';
import preciseDaptTranslations from './precise-dapt';
import ahaPreventTranslations from './aha-prevent';
import shfmTranslations from './shfm';
import gwtgHfRiskTranslations from './gwtg-hf-risk';
import { heartFailureStagingTranslations } from './heart-failure-staging';
import { stsAdultCardiacTranslations } from './sts-adult-cardiac';

export default {
  ...riskAssessmentTranslations,
  
  // Calculator titles for navigation
  graceTitle: 'GRACE 2.0 კალკულატორი',
  hcmRiskScdTitle: 'HCM Risk-SCD კალკულატორი',
  maggicTitle: maggicTranslations.title,
  gwtgHfTitle: 'GWTG-HF კალკულატორი',
  heartFailureStagingTitle: 'გულის უკმარისობის ეტაპები',
  heartFailureStaging: heartFailureStagingTranslations,
  shfmTitle: 'SHFM რისკის კალკულატორი',
  stsTitle: 'STS რისკის კალკულატორი',
  euroScoreTitle: 'EuroSCORE II კალკულატორი',
  timiTitle: 'TIMI რისკის კალკულატორი',
  preventTitle: 'AHA PREVENT კალკულატორი',
  hcmAfTitle: 'HCM-AF კალკულატორი',
  chadsVascTitle: 'CHA2DS2-VASc კალკულატორი',
  hasBleedTitle: 'HAS-BLED კალკულატორი',
  chads2Title: 'CHADS2 კალკულატორი',
  ascvdTitle: 'ᲐᲡᲖᲓ რისკის კალკულატორი',

  // Calculator references used by main calculator list
  timi_risk: {
    title: 'TIMI რისკის კალკულატორი',
    subtitle: 'არასტაბილური ანგინა/NSTEMI რისკის შეფასება'
  },
  
  grace_acs: {
    title: 'GRACE ACS რისკის კალკულატორი',
    subtitle: 'მწვავე კორონარული სინდრომის სიკვდილობის რისკი'
  },

  // GRACE 2.0 Risk Calculator
  grace: grace2Translations,

  // HCM Risk-SCD Calculator
  hcm_risk_scd: {
    title: "ᲒᲙᲛᲞ რისკ-ვგს კალკულატორი",
    subtitle: "უეცარი გულის სიკვდილის რისკის შეფასება • ჰიპერტროფიული კარდიომიოპათია",
    description: "5-წლიანი უეცარი გულის სიკვდილის რისკის პროგნოზირება ჰიპერტროფიული კარდიომიოპათიის მქონე პაციენტებში ICD-ის გადაწყვეტისთვის.",
    calculate_button: "ᲒᲙᲛᲞ რისკ-ვგს-ის გამოთვლა",
    risk_category: "რისკის კატეგორია",
    recommendations: "კლინიკური რეკომენდაციები",
    low_risk: "დაბალი რისკი (<4%)",
    high_risk: "მაღალი რისკი (≥6%)",
    intermediate_risk: "საშუალო რისკი (4-6%)",
    
    demographics: "დემოგრაფია",
    age_label: "ასაკი (წლები)",
    age_placeholder: "შეიყვანეთ პაციენტის ასაკი (16-80 წელი)",
    gender_label: "სქესი",
    gender_male: "მამრობითი",
    gender_female: "მდედრობითი",
    clinical_features: "კლინიკური ნიშნები",
    max_wall_thickness: "კედლის მაქსიმალური სისქე (მმ)",
    max_wall_thickness_placeholder: "შეიყვანეთ სისქე (10-50 მმ)",
    left_atrial_size: "მარცხენა წინაგულის ზომა (მმ)",
    left_atrial_size_placeholder: "შეიყვანეთ ზომა (25-70 მმ)",
    max_lvot_gradient: "LVOT-ის მაქსიმალური გრადიენტი (მმ ვარდ.სვ.)",
    max_lvot_gradient_placeholder: "შეიყვანეთ გრადიენტი (0-200 მმ ვარდ.სვ.)",
    risk_factors: "რისკის ფაქტორები",
    family_history_scd: "უეცარი გულით სიკვდილის ოჯახური ანამნეზი",
    non_sustained_vt: "არამდგრადი პარკჭოვანი ტაქიკარდია",
    unexplained_syncope: "აუხსნელი სინკოპე",
    additional_factors: "დამატებითი რისკ-ფაქტორები",
    apical_aneurysm: "აპიკალური ანევრიზმა",
    extensive_lge: "ვრცელი გვიანი გადოლინიუმის გაძლიერება (>15% LV მასის)",
    exclusions: "გამორიცხვის კრიტერიუმები",
    prior_scd: "ადრინდელი უეცარი გულის სიკვდილი",
    prior_icd: "ადრინდელი ICD",
    concurrent_vhd: "თანმხლები მნიშვნელოვანი სარქვლოვანი გულის დაავადება",
    infiltrative_disease: "ინფილტრაციული კარდიომიოპათია",
    validation_age: "ასაკი უნდა იყოს 16-80 წლის შორის",
    validation_gender: "სქესი აუცილებელია",
    validation_wall_thickness: "კედლის სისქე უნდა იყოს 10-50 მმ-ს შორის",
    validation_atrial_size: "მარცხენა წინაგულის ზომა უნდა იყოს 25-70 მმ-ს შორის",
    validation_lvot_gradient: "LVOT გრადიენტი უნდა იყოს 0-200 მმ ვარდ.სვ.-ს შორის",
    five_year_risk: "5-წლიანი VGS რისკი",
    icd_recommendation: "ICD რეკომენდაცია",
    not_indicated: "არ არის ნაჩვენები",
    consider: "განიხილეთ",
    reasonable: "გონივრული",
    indicated: "ნაჩვენები"
  },

  // GWTG-HF Risk Calculator - Extracted to standalone file
  gwtgHf: gwtgHfRiskTranslations,

  // MAGGIC Risk Calculator - Extracted to standalone file
  maggic: maggicTranslations,

  // SHFM Calculator
  // STS Adult Cardiac Surgery Risk Calculator - Extracted to standalone file
  sts: stsAdultCardiacTranslations,

  // DAPT Score Calculator - imported from standalone file
  dapt: daptTranslations,

  // TIMI Risk Calculator - imported from standalone file
  timi: timiRiskScoreTranslations,

  // PRECISE-DAPT Calculator - imported from standalone file
  precise_dapt: preciseDaptTranslations,

  // AHA PREVENT™ Calculator - Extracted to standalone file
  prevent: ahaPreventTranslations,

  // SHFM Risk Calculator - Extracted to standalone file
  shfm: shfmTranslations,

  // Atrial Fibrillation section moved to risk-assessment.ts

  // GWTG-HF Risk Calculator
  gwtg_hf: {
    title: 'GWTG-HF რისკის კალკულატორი',
    subtitle: 'გაიდლაინები მკურნალობისთვის - გულის უკმარისობის რისკის შეფასება'
  },
  chads_vasc: {
    title: 'CHA2DS2-VASc ქულა წინაგულების ფიბრილაციის ინსულტის რისკისთვის',
    subtitle: 'აფასებს ინსულტის რისკს არასარქვლოვანი წინაგულების ფიბრილაციის მქონე პაციენტებში',
    description: 'CHA2DS2-VASc ქულა არის კლინიკური პროგნოზირების წესი არარევმატული წინაგულების ფიბრილაციის (AF) მქონე პაციენტებში ინსულტის რისკის შესაფასებლად.',
    age: 'ასაკი',
    sex: 'სქესი',
    female: 'მდედრობითი',
    male: 'მამრობითი',
    hypertension: 'ჰიპერტენზია',
    diabetes: 'შაქრიანი დიაბეტი',
    chf: 'გულის შეგუბებითი უკმარისობა',
    stroke_tia: 'წინა ინსულტი, TIA ან თრომბოემბოლია',
    vascular_disease: 'სისხლძარღვთა დაავადება (წინა მიოკარდიუმის ინფარქტი, PAD ან აორტის დაფა)',
    calculate_button: 'CHA2DS2-VASc ქულის გამოთვლა',
    result_title: 'CHA2DS2-VASc ქულა',
    result_interpretation: 'ინტერპრეტაცია',
    thromb_prophylaxis_rec: 'თრომბოპროფილაქტიკის რეკომენდაციები',
    score_0_rec: 'ასპირინი ან თერაპიის გარეშე შეიძლება განიხილებოდეს',
    score_1_rec: 'პერორალური ანტიკოაგულანტი ან ასპირინი შეიძლება განიხილებოდეს',
    score_2_rec: 'რეკომენდებულია პერორალური ანტიკოაგულანტი',
  },
};
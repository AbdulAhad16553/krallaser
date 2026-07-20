export interface InstallationFaq {
  question: string;
  answer: string;
}

export const MACHINE_INSTALLATION_TITLE =
  "KRAL Laser Machine — Zameen Mein Lagane Ka Tareeqa";

export const MACHINE_INSTALLATION_INTRO =
  "Yeh guide aapko batati hai ke KRAL Laser cutting machine ko floor par kaise anchor aur weld karna hai — base plates, expansion bolts, aur kamzor cement floor ke liye concrete pillars.";

export const MACHINE_INSTALLATION_STEPS = [
  {
    step: 1,
    title: "Base anchor plates tayyar karen",
    detail:
      "Sabse pehle 10 base anchor plates banayen — Q235 steel, 14mm motai. Har plate ka size aapki machine ki technical drawing mein diya hua hai.",
  },
  {
    step: 2,
    title: "Plates ko floor par fix karen",
    detail:
      "Har plate ko M12×100 expansion bolt se floor par mazboot tareeqe se fix karen. Total 40 expansion bolts lagenge (har plate par 4 bolts).",
  },
  {
    step: 3,
    title: "Machine ko weld karen",
    detail:
      "Machine ko sahi position par rakh kar, machine aur base plates ko aapas mein weld kar dein taake machine harkat na kare.",
  },
  {
    step: 4,
    title: "Kamzor floor — concrete pillar",
    detail:
      "Agar floor ka cement kamzor hai to har base plate ke neeche 400×400×600 mm ka concrete pillar banwayen, phir plate us pillar par fix karen. Agar floor pehle se strong hai to plate seedha floor par lagayi ja sakti hai.",
  },
] as const;

export const MACHINE_INSTALLATION_FAQS: InstallationFaq[] = [
  {
    question: "KRAL Laser machine ko zameen mein lagane ke liye kitni base plates chahiye?",
    answer:
      "Total 10 base anchor plates lagti hain. Material Q235 steel honi chahiye aur motai 14mm. Har plate ka exact size machine ki supply drawing par likha hota hai — us drawing ke mutabiq plates banwayen.",
  },
  {
    question: "Base plates floor par kaise fix kiye jate hain?",
    answer:
      "Har plate ko M12×100 expansion bolt se floor par fix karen. Poori machine ke liye total 40 bolts lagenge (average 4 bolts har plate par). Bolts ko torque ke mutabiq tight karen taake machine vibration se loose na ho.",
  },
  {
    question: "Machine ko base plates se kaise joda jata hai?",
    answer:
      "Machine ko level karke sahi jagah par rakhain. Phir machine frame aur base anchor plates ko aapas mein weld kar dein. Welding poori tarah complete honi chahiye taake cutting ke doran machine shift na kare.",
  },
  {
    question: "Agar factory floor ka cement kamzor ho to kya karen?",
    answer:
      "Kamzor cement floor par seedha anchor mat lagayen. Har base plate ke neeche 400×400×600 mm ka concrete pillar banwayen, use poori tarah cure hone dein, phir expansion bolts ke zariye plate us pillar par fix karen.",
  },
  {
    question: "Agar floor pehle se mazboot ho to kya seedha plate laga sakte hain?",
    answer:
      "Haan. Agar industrial floor / raft foundation pehle se strong hai (thick RCC ya steel-reinforced slab) to base anchor plate seedha floor par expansion bolts se fix ki ja sakti hai — alag concrete pillar ki zaroorat nahi.",
  },
  {
    question: "Installation ke baad machine level kyun zaroori hai?",
    answer:
      "Agar machine level na ho to cutting accuracy kharab ho sakti hai aur rails par zyada load parta hai. Installation se pehle aur baad mein spirit level / laser level se bed check karen.",
  },
];

export function buildMachineInstallationFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: MACHINE_INSTALLATION_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export interface PresetDecision {
  title: string;
  category: string;
  options: string[];
  context: string;
}

export const PRESET_DECISIONS: PresetDecision[] = [
  {
    title: 'Should I quit my corporate job to join an early-stage startup as a founding engineer?',
    category: 'Career & Life',
    options: ['Accept Startup Founding Offer', 'Remain at Corporate Role with Promotion Track'],
    context: 'Have 6 months of emergency savings. High appetite for technical ownership and speed, but value mental sanity and work-life balance.',
  },
  {
    title: 'Should we buy our first home in the suburbs or rent closer to the city center and invest the difference?',
    category: 'Finance & Housing',
    options: ['Buy Suburb Single-Family Home', 'Rent Downtown Apartment & Invest in ETFs'],
    context: 'Current mortgage rates are around 6.5%. Planning to stay put for at least 4-5 years, but career flexibility is important.',
  },
  {
    title: 'Should I buy a fully electric vehicle (EV) or a reliable plug-in hybrid (PHEV)?',
    category: 'Purchasing',
    options: ['Full Battery Electric Vehicle (EV)', 'Plug-in Hybrid (PHEV)'],
    context: 'Daily commute is 25 miles roundtrip. Take 3-4 long road trips per year. Have home garage charging available.',
  },
  {
    title: 'Should our company mandate a 3-day Return to Office (RTO) or stay fully distributed remote-first?',
    category: 'Leadership & Team',
    options: ['Mandate 3-Day Hybrid In-Office', 'Maintain Flexible Remote-First Policy'],
    context: 'Staff is currently spread across 4 time zones. Cross-collaboration and onboarding juniors has slowed down, but retention is currently high.',
  },
];

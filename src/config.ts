export const business = {
  owner: 'Kati Schepis-Buck',
  email: 'info@katischepis.ch',
  telephone: '+41793823680',
  street: 'Auenrainstrasse 7',
  postalCode: '8413',
  locality: 'Neftenbach',
  country: 'CH',
};

export const features = {
  fengShuiTableOfContents: true,
  contactConfirmationEmail: false,
};

export const mail = {
  from: 'Kati Schepis · Website <website@katischepis.ch>',
  to: 'info@katischepis.ch',
  replyTo: 'info@katischepis.ch',
};

export const mailchimp = {
  audienceId: 'f06552ddff',
  doubleOptIn: true,
  tags: {
    blog: 'Blogseite',
    contact: 'Kontaktformular',
  },
};

export const mailLimits = {
  perIpPerHour: 3,
  perIpPerDay: 8,
  globalPerDay: 80,
  minSecondsBeforeSubmit: 3,
};

/**
 * contact.js — vCard / VCF Generation & Save Contact
 * Xenelasia Consultancy Digital Business Card
 * ============================================================
 */

'use strict';

const ContactManager = (() => {
  /* ─── Contact Data ──────────────────────────────────────── */
  const CONTACT = {
    firstName:   'Kartik',
    lastName:    'Verma',
    fullName:    'Kartik Verma',
    org:         'Xenelasia Consultancy',
    title:       'Tech Expert',
    phone:       '+918126338976',
    email:       'kartik.verma.cs@gmail.com',
    website:     'https://xcplllp.com',
    linkedin:    'https://linkedin.com/in/kartikverma',
    address: {
      street:  '1908, Iconic Corenthum Tower',
      city:    'Noida',
      state:   'Uttar Pradesh',
      country: 'India',
      postal:  '201309',
    },
  };

  /* ─── Build vCard 3.0 string ────────────────────────────── */
  function buildVCF() {
    const { firstName, lastName, fullName, org, title, phone, email, website, linkedin, address } = CONTACT;

    // vCard 3.0 format — maximum compatibility across iOS, Android, Windows
    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName};${firstName};;;`,
      `FN:${fullName}`,
      `ORG:${org}`,
      `TITLE:${title}`,
      `TEL;TYPE=CELL:${phone}`,
      `EMAIL;TYPE=WORK:${email}`,
      `URL;TYPE=WORK:${website}`,
      `URL;TYPE=LinkedIn:${linkedin}`,
      `ADR;TYPE=WORK:;;${address.street};${address.city};${address.state};${address.postal};${address.country}`,
      `NOTE:Tech Expert specialising in AI\\, Cybersecurity\\, Cloud Solutions and Digital Transformation.`,
      `X-SOCIALPROFILE;type=linkedin:${linkedin}`,
      `REV:${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z`,
      'END:VCARD',
    ].join('\r\n');
  }

  /* ─── Trigger VCF download ──────────────────────────────── */
  function saveContact() {
    const vcfContent = buildVCF();
    const blob  = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
    const url   = URL.createObjectURL(blob);
    const link  = document.createElement('a');
    link.href     = url;
    link.download = 'kartik-verma.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /* ─── Init ──────────────────────────────────────────────── */
  function init() {
    const saveBtn = document.getElementById('save-contact-btn');
    saveBtn?.addEventListener('click', function () {
      saveContact();
      if (typeof Toast !== 'undefined') {
        Toast.show('📱 Contact saved! Check your downloads.');
      }
      // Ripple
      if (typeof addRipple !== 'undefined') addRipple(this);
    });
  }

  return { init, saveContact, CONTACT };
})();

document.addEventListener('DOMContentLoaded', () => {
  ContactManager.init();
});

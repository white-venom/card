/**
 * contact.js — vCard / VCF Generation & Save Contact
 * Xenelasia Consultancy Digital Business Card
 * ============================================================
 */

'use strict';

const ContactManager = (() => {
  /* ─── Contact Data (Loaded dynamically) ────────────────── */
  let CONTACT = {};

  /* ─── Build vCard 3.0 string ────────────────────────────── */
  function buildVCF() {
    const { firstName, lastName, fullName, company, designation, phone, email, website, linkedin, address, bio } = CONTACT;

    // vCard 3.0 format — maximum compatibility across iOS, Android, Windows
    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName || ''};${firstName || ''};;;`,
      `FN:${fullName || ''}`,
      `ORG:${company || ''}`,
      `TITLE:${designation || ''}`,
      `TEL;TYPE=CELL:${phone || ''}`,
      `EMAIL;TYPE=WORK:${email || ''}`,
      `URL;TYPE=WORK:${website || ''}`,
      `URL;TYPE=LinkedIn:${linkedin || ''}`,
      `ADR;TYPE=WORK:;;${address?.street || ''};${address?.city || ''};${address?.state || ''};${address?.postal || ''};${address?.country || ''}`,
      `NOTE:${bio || ''}`,
      `X-SOCIALPROFILE;type=linkedin:${linkedin || ''}`,
      `REV:${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z`,
      'END:VCARD',
    ].join('\r\n');
  }

  /* ─── Trigger VCF download ──────────────────────────────── */
  function saveContact() {
    if (!CONTACT.firstName) return;
    const vcfContent = buildVCF();
    const blob  = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
    const url   = URL.createObjectURL(blob);
    const link  = document.createElement('a');
    link.href     = url;
    
    const filename = `${CONTACT.firstName.toLowerCase()}-${(CONTACT.lastName || '').toLowerCase()}.vcf`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /* ─── Init ──────────────────────────────────────────────── */
  function init() {
    document.addEventListener('employeeLoaded', (e) => {
      CONTACT = e.detail;
    });

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

  return { init, saveContact };
})();

document.addEventListener('DOMContentLoaded', () => {
  ContactManager.init();
});

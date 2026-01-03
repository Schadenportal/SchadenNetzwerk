/* eslint-disable react/no-unescaped-entities */
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

export default function DataProtectionSection() {
  const { t } = useTranslate();

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('data_protection')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('data_protection'), href: paths.dashboard.dataProtection },
        ]}
      />

      <Box my={3} sx={{ color: (theme) => theme.palette.text.tableText }}>
        {/* I */}
        <Typography variant="h6" mt={3}>
          I. Allgemeine Informationen und Verantwortlichkeiten
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>1. Geltungsbereich und Zielgruppe</b>
        </Typography>
        <Typography variant="subtitle2">
          Diese Datenschutzerklärung gilt ausschließlich für die angemeldete Nutzung (nach dem Login) unserer
          Software-as-a-Service-Plattform „SchadenNetzwerk“. Sie richtet sich an die Mitarbeiter und Beauftragten
          unserer Kunden (z. B. Autohäuser, Werkstätten, Versicherer), die im System arbeiten.
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>2. Die „Zwei-Rollen-Unterscheidung“ (Wichtig!)</b>
        </Typography>
        <Typography variant="subtitle2">
          Damit Sie verstehen, wer für Ihre Daten zuständig ist, müssen wir zwei Bereiche unterscheiden:
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>Bereich A: Ihre Benutzerdaten & Systemsicherheit</b>
        </Typography>
        <Typography variant="subtitle2">
          Für Ihre Anmeldedaten (Login), Ihre Nutzungslogs und die technische Sicherheit der Plattform sind wir der
          Verantwortliche. Wir entscheiden, wie diese Daten verarbeitet werden, um den Betrieb sicherzustellen.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Ansprechpartner: B. Giese SchadenNetzwerk (siehe Ziffer 3).
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>Bereich B: Die Daten in den Schadenakten</b>
        </Typography>
        <Typography variant="subtitle2">
          Für alle Daten, die Sie in Schadenakten eingeben (z. B. Namen von Kunden, Fahrzeugdaten, Fotos, Gutachten),
          ist Ihr Arbeitgeber bzw. Auftraggeber (unser Kunde) der Verantwortliche im Sinne der DSGVO. Wir verarbeiten
          diese Daten ausschließlich als weisungsgebundener Auftragsverarbeiter.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Ansprechpartner: Bitte wenden Sie sich für Fragen zu diesen Inhalten an Ihren Arbeitgeber.
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>3. Name und Anschrift des Verantwortlichen (für Bereich A)</b>
        </Typography>
        <Typography variant="subtitle2">
          B. Giese SchadenNetzwerk
          <br />
          Ostringhausen 19
          <br />
          42929 Wermelskirchen
          <br />
          Deutschland
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          E-Mail: datenschutz@schadennetzwerk.com
          <br />
          Inhaber: B. Giese
        </Typography>

        {/* II */}
        <Typography variant="h6" mt={3}>
          II. Die Datenverarbeitung im Detail
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Wir verarbeiten Ihre personenbezogenen Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen
          Plattform sowie unserer Inhalte und Leistungen erforderlich ist.
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>1. Bereitstellung der Plattform & Logfiles</b>
        </Typography>
        <Typography variant="subtitle2">
          Bei jedem Aufruf der Plattform erfassen unsere Systeme automatisiert Daten und Informationen vom
          Computersystem des aufrufenden Rechners.
        </Typography>

        <Typography variant="subtitle2" mt={1}>
          Verarbeitete Daten:
        </Typography>
        <ul>
          <li>
            <Typography variant="subtitle2">IP-Adresse (ggf. anonymisiert).</Typography>
          </li>
          <li>
            <Typography variant="subtitle2">Datum und Uhrzeit des Zugriffs (Timestamp).</Typography>
          </li>
          <li>
            <Typography variant="subtitle2">Browsertyp, Version und Spracheinstellung.</Typography>
          </li>
          <li>
            <Typography variant="subtitle2">Betriebssystem und dessen Oberfläche.</Typography>
          </li>
          <li>
            <Typography variant="subtitle2">Referrer-URL (die zuvor besuchte Seite, meist der Login).</Typography>
          </li>
          <li>
            <Typography variant="subtitle2">Status-Codes (z. B. HTTP 200, 404).</Typography>
          </li>
          <li>
            <Typography variant="subtitle2">Übertragene Datenmenge.</Typography>
          </li>
        </ul>

        <Typography variant="subtitle2">
          Zweck: Gewährleistung der dauerhaften Funktionsfähigkeit und Sicherheit unserer IT-Systeme (z. B. DDoS-Abwehr),
          Fehleranalyse bei Abstürzen.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (Berechtigtes Interesse an der Sicherheit).
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Speicherdauer: Logfiles werden routinemäßig nach 30 Tagen gelöscht, sofern keine sicherheitsrelevanten Vorfälle
          eine längere Speicherung zur Beweissicherung erfordern.
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>2. Benutzerkonto, Registrierung & Verwaltung</b>
        </Typography>
        <Typography variant="subtitle2">
          Um in der SaaS arbeiten zu können, wird für Sie ein Benutzerkonto angelegt.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Verarbeitete Daten: Vorname, Nachname, geschäftliche E-Mail-Adresse, zugewiesene Firma/Filiale, Benutzerrolle
          (z. B. „Admin“, „Sachbearbeiter“), Passwort (kryptografisch gehasht).
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Zweck: Identifikation des Nutzers, Zuweisung von Berechtigungen, Schutz vor unbefugtem Zugriff.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung gegenüber Ihrem Arbeitgeber und Bereitstellung
          des Dienstes an Sie).
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>3. Single Sign-On (SSO) & Authentifizierung</b>
        </Typography>
        <Typography variant="subtitle2">
          Soweit Sie sich über Microsoft oder Google anmelden (oder Ihr Arbeitgeber dies erzwingt), nutzen wir externe
          Identitätsanbieter.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Eingesetzte Dienste:
        </Typography>
        <ul>
          <li>
            <Typography variant="subtitle2">Microsoft Entra ID (vormals Azure AD).</Typography>
          </li>
          <li>
            <Typography variant="subtitle2">Google Identity Platform.</Typography>
          </li>
        </ul>
        <Typography variant="subtitle2">
          Funktionsweise: Wir erhalten keine Passwörter von diesen Anbietern. Wir leiten Sie zur Anmeldung an deren
          Server weiter. Nach erfolgreicher Anmeldung erhalten wir ein digitales „Token“, das bestätigt: „Dieser Nutzer
          ist Max Mustermann von Autohaus Schmidt“. Wir speichern Ihre von Microsoft/Google übermittelte User-ID und
          E-Mail-Adresse zur Zuordnung.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (Berechtigtes Interesse an erhöhter Sicherheit durch zentrale
          Verwaltung) sowie Art. 6 Abs. 1 lit. b DSGVO.
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>4. Transaktionale E-Mails & Benachrichtigungen</b>
        </Typography>
        <Typography variant="subtitle2">
          Das System versendet automatische Benachrichtigungen (z. B. „Neuer Schaden zugewiesen“, „Passwort vergessen“,
          „2-Faktor-Code“).
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Eingesetzte Dienstleister: Twilio SendGrid (E-Mail) und Twilio (SMS).
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Verarbeitete Daten: E-Mail-Adresse, Mobilnummer, Inhalt der Nachricht, Zustellstatus (Delivered/Bounced),
          Öffnungsrate (technisch bedingt).
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>5. Support-Anfragen & Ticketsystem</b>
        </Typography>
        <Typography variant="subtitle2">
          Wenn Sie technische Unterstützung benötigen, verarbeiten wir Ihre Anfragen.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Verarbeitete Daten: Kontaktdaten (Telefon, E-Mail), Fehlerbeschreibung, Screenshots, Zeitpunkt der Meldung.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Telefonie: Wir nutzen sipgate für unsere Hotline. Verbindungsdaten werden nach den gesetzlichen Vorgaben
          gespeichert.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Zweck: Behebung von Fehlern, Verbesserung der Servicequalität.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Supportvertrag).
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>6. Systemoptimierung & KI-Training (Anonymisiert)</b>
        </Typography>
        <Typography variant="subtitle2">
          Wir nutzen Nutzungsdaten, um unsere Plattform intelligenter und stabiler zu machen.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Verfahren: Wir analysieren, wie Funktionen genutzt werden (z. B. Klickpfade, Nutzungshäufigkeit von Modulen,
          Ladezeiten).
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Anonymisierung: Diese Daten werden aggregiert und anonymisiert. Ein Rückschluss auf Ihre Person oder konkrete
          Geschäftsgeheimnisse Ihres Arbeitgebers ist in den Datensätzen für das KI-Training nicht mehr möglich.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Zweck: Training von Algorithmen zur Erkennung von Anomalien, Verbesserung der UX, Lastverteilung.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (Berechtigtes Interesse an der Produktverbesserung und
          Wettbewerbsfähigkeit).
        </Typography>

        {/* III */}
        <Typography variant="h6" mt={3}>
          III. Cookies, Local Storage & Session-Daten
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Wir setzen im internen Bereich keine Werbe-Cookies ein. Wir nutzen ausschließlich Technologien, die technisch
          zwingend erforderlich sind.
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>1. Local Storage / Session Storage</b>
        </Typography>
        <Typography variant="subtitle2">
          Wir nutzen die moderne Web-Technologie „Local Storage“ (im Browser), um Ihren Anmeldestatus zu speichern.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Firebase Auth Token: Damit Sie sich nicht bei jedem Klick neu einloggen müssen, speichert Firebase ein
          verschlüsseltes Authentifizierungs-Token lokal in Ihrem Browser.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Speicherdauer: Bis zum Logout oder Ablauf der Session (Token-Refresh).
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Notwendigkeit: Ohne diese Speicherung ist der Betrieb einer geschützten SaaS-Anwendung technisch nicht möglich
          (§ 25 Abs. 2 Nr. 2 TTDSG).
        </Typography>

        {/* IV */}
        <Typography variant="h6" mt={3}>
          IV. Empfänger und Datenübermittlung
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Wir geben Ihre personenbezogenen Daten grundsätzlich nicht an Dritte weiter. Ausgenommen sind unsere
          technischen Dienstleister (Auftragsverarbeiter), die wir vertraglich streng gebunden haben.
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>1. Hosting & Infrastruktur</b>
        </Typography>
        <ul>
          <li>
            <Typography variant="subtitle2">
              Hetzner Online GmbH (Deutschland): Physische Server, Rechenzentrum.
            </Typography>
          </li>
          <li>
            <Typography variant="subtitle2">
              Google Cloud / Firebase (Serverstandort Frankfurt, EU): Datenbank, Backend-Logik, Hosting.
            </Typography>
          </li>
        </ul>

        <Typography variant="subtitle2" mt={2}>
          <b>2. Identität & Kommunikation</b>
        </Typography>
        <ul>
          <li>
            <Typography variant="subtitle2">Microsoft Ireland Operations Ltd. (Irland/EU): Bei Nutzung von Microsoft-Login.</Typography>
          </li>
          <li>
            <Typography variant="subtitle2">Twilio Inc. / SendGrid (USA/Irland): Versand von System-E-Mails und SMS.</Typography>
          </li>
        </ul>

        <Typography variant="subtitle2" mt={2}>
          <b>3. Drittlandübermittlung (USA)</b>
        </Typography>
        <Typography variant="subtitle2">
          Einige unserer Dienstleister (Google, Microsoft, Twilio) sind Tochtergesellschaften von US-Konzernen. Es ist
          technisch nicht vollständig auszuschließen, dass Daten (z. B. Support-Tickets, Metadaten) in die USA gelangen.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Absicherung: Wir setzen auf Anbieter, die nach dem EU-U.S. Data Privacy Framework (DPF) zertifiziert sind
          (Angemessenheitsbeschluss der EU-Kommission).
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Zusätzliche Garantie: Sollte ein Anbieter nicht unter das DPF fallen, vereinbaren wir die
          EU-Standardvertragsklauseln (SCCs) und treffen zusätzliche technische Maßnahmen (Verschlüsselung), um das
          Schutzniveau zu sichern.
        </Typography>

        {/* V */}
        <Typography variant="h6" mt={3}>
          V. Datensicherheit
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Wir setzen umfangreiche technische und organisatorische Maßnahmen (TOMs) ein, um Ihre Daten zu schützen:
        </Typography>
        <ul>
          <li>
            <Typography variant="subtitle2">
              Verschlüsselung: Jeglicher Datenverkehr ist per TLS 1.3 (SSL) verschlüsselt. Datenbanken sind „at rest“
              (auf der Festplatte) verschlüsselt (AES-256).
            </Typography>
          </li>
          <li>
            <Typography variant="subtitle2">
              Zugriffskontrolle: Strikte Rollenkonzepte und Mandantentrennung verhindern, dass Nutzer anderer Firmen Ihre
              Daten sehen.
            </Typography>
          </li>
          <li>
            <Typography variant="subtitle2">
              Schutz vor Angriffen: Einsatz von Web Application Firewalls (WAF) und DDoS-Schutz durch Google
              Infrastructure.
            </Typography>
          </li>
        </ul>

        {/* VI */}
        <Typography variant="h6" mt={3}>
          VI. Ihre Rechte als betroffene Person
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Nach der DSGVO stehen Ihnen folgende Rechte zu. Bitte beachten Sie die Unterscheidung aus Abschnitt I (Ziffer
          2).
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>1. Rechte gegenüber uns (für Account-Daten)</b>
        </Typography>
        <Typography variant="subtitle2">
          Sie können sich direkt an uns wenden (datenschutz@schadennetzwerk.com), um:
        </Typography>
        <ul>
          <li>
            <Typography variant="subtitle2">
              Auskunft über Ihre gespeicherten Benutzerdaten zu erhalten (Art. 15 DSGVO).
            </Typography>
          </li>
          <li>
            <Typography variant="subtitle2">
              Berichtigung falscher Stammdaten zu verlangen (Art. 16 DSGVO).
            </Typography>
          </li>
          <li>
            <Typography variant="subtitle2">
              Löschung Ihres Accounts zu beantragen, sofern keine Aufbewahrungspflichten bestehen (Art. 17 DSGVO).
            </Typography>
          </li>
          <li>
            <Typography variant="subtitle2">
              Der Verarbeitung zu widersprechen (Art. 21 DSGVO), soweit wir diese auf „berechtigtes Interesse“ stützen.
            </Typography>
          </li>
        </ul>

        <Typography variant="subtitle2" mt={2}>
          <b>2. Rechte bezüglich Schadenakten</b>
        </Typography>
        <Typography variant="subtitle2">
          Möchten Sie Daten in einer Schadenakte (z. B. einen Unfallbericht) einsehen, korrigieren oder löschen lassen,
          müssen wir Sie an Ihren Arbeitgeber verweisen. Als Auftragsverarbeiter dürfen wir diese Daten nicht
          eigenmächtig verändern oder herausgeben. Wir werden Ihre Anfrage jedoch gerne an den entsprechenden
          Ansprechpartner in Ihrem Unternehmen weiterleiten.
        </Typography>

        <Typography variant="subtitle2" mt={2}>
          <b>3. Beschwerderecht</b>
        </Typography>
        <Typography variant="subtitle2">
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, wenn Sie der Ansicht sind,
          dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstößt.
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Zuständige Behörde für uns: Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen
          (LDI NRW).
        </Typography>

        {/* VII */}
        <Typography variant="h6" mt={3}>
          VII. Automatisierte Entscheidungsfindung
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Wir nutzen keine vollautomatisierte Entscheidungsfindung oder Profiling gemäß Art. 22 DSGVO, die Ihnen
          gegenüber rechtliche Wirkung entfaltet (z. B. automatisierte Kündigung).
        </Typography>

        {/* VIII */}
        <Typography variant="h6" mt={3}>
          VIII. Aktualität und Änderung
        </Typography>
        <Typography variant="subtitle2" mt={1}>
          Diese Datenschutzerklärung ist aktuell gültig und hat den Stand Januar 2026. Durch die Weiterentwicklung
          unserer Plattform oder aufgrund geänderter gesetzlicher beziehungsweise behördlicher Vorgaben kann es
          notwendig werden, diese Datenschutzerklärung zu ändern. Die jeweils aktuelle Datenschutzerklärung kann
          jederzeit auf der Website unter „Datenschutz“ von Ihnen abgerufen und ausgedruckt werden.
        </Typography>
      </Box>
    </Container>
  );
}

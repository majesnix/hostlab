# Nutzerhandbuch
Hier finden Sie das Benutzerhandbuch für die Bedienung des Hostlabs.
Für die Inbetriebnahme klicken Sie [hier](#)

# Anmeldung im Hostlab
Um sich im Hostlab anzumelden navigieren Sie zur [Login-Seite](#) und melden sich mit den Hochschul Logindaten an (z.B. max.mustermann@hsrw.org).
Wenn Sie sich das erste mal einloggen wird ein [Gitlab](#) Account für Sie erstellt, der zur Versionsverwaltung, sowie dem Bereitstellen des Quellcodes zum deployen einer [Node.js](https://nodejs.org/en) App genutzt wird.

# Konfiguration Ihrer Node.js App
// TODO: Ergänzen
Um auf Ihre **Mongo** Datenbank zugreifen zu können verwenden Sie folgenden Connection-String in Ihrer App
```js
mongodb://mongo/<dbname>
```
Für PostgreSQL:
```js
mongodb://postgres
```



# Deployen einer Node.js App
Durch Klicken auf den Reiter [Node.js](#node) gelangen Sie zu der Seite, auf der Sie Ihre Apps deployen können.
## Blueprints erstellen
- Wenn Sie das erste mal auf diese Seite navigieren erstellen Sie einen **Blueprint** über den dafür vorgesehenen Button.
- Auf der darauffolgenden Seite sehen Sie Ihre Gitlab Repositories in einem Dropdown Menu
-- Wählen Sie eins aus und geben Sie ihm optional einen Namen
-- Bei Klick auf **Create Blueprint** wird dieser erstellt und Sie werden weitergeleitet

## Blueprint nutzen
Nach Klick auf den Reiter [Node.js](#node) sehen Sie nun Ihren Blueprint.
Dieser dient als Ausgangspunkt um Ihre App zu starten. Blueprints können über den Button in der oberen rechten Ecke auch wieder gelöscht werden.

### App erstellen
Klicken Sie in Ihrem erstellten **Blueprint** auf **Create App**
- Es öffnet sich eine neue Maske in der Sie den Pfad, auf dem die App verfügbar sein soll, eingeben können
- Wählen Sie ihr Script aus der *package.json* aus, welches Sie starten möchten
- Wählen Sie eine Datenbank aus, sofern benötigt
- Der Button **Create App** startet nun Ihre Node.js App

### Apps verwalten
Ihre Apps können Sie auf der Seite [Node.js](#/node) einsehen. Alle Apps können mit den dafür betitelten Buttons gelöscht oder deaktiviert/reaktiviert werden

# Verwaltung der MongoDB
Zur Verwaltung der zur Verfügung gestellten Mongo Datenbank klicken Sie auf den Reiter [MongoDB](./mongo) in der linken Navigation.
Hier sehen Sie viele Informationen zu Ihrer Datenbank und können von hier Anpassungen am Datenmodell vornehmen. Für weitere Informationen und Features siehe [Mongo-Express](https://github.com/mongo-express/mongo-express#features)

# Verwaltung der PostgreSQL DB

# Gitlab

Wenn Sie sich das erste mal erfolgreich im Hostlab eingeloggt haben wird Ihnen ein [Gitlab](#) Account erstellt.
Um eine Node.js App deployen zu können müssen Sie Ihren Quellcode in ein Repository pushen.
Nach einem erfolgreichen Push wird die Anwendung sofort im Hostlab registriert sobald das erste mal auf [Node.js](#/node) navigiert wird.

---
# Zusätzliche Bedienung für Administratoren

## Userverwaltung

Um in die Nutzervewaltung zu gelangen klicken Sie in der Linken Navigation auf den Punkt [Users](./admin/users).
Hier sehen Sie alle im Hostlab registrierten Accounts und ob diese aktiv sind bzw. administrative Rechte besitzen.
Bei Klick auf einen Nutzernamen können Sie diesen editieren und den Account deaktivieren bzw. ihm Administratorrechte hinzufügen.
Sollten tiefgreifendere Anpassungen vorgenommen werden müssen muss direkt in der MongoDB des Hostlabs der User editiert werden.

---
# License
Apache License  
Version 2.0, January 2004  
https://www.apache.org/licenses/  

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

  Copyright [2018] [Adrian Beckmann,Denis Paris, Dominic Classen, Jan Wystub, Manuel Eder, René Heinen, René Neißer]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       https://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

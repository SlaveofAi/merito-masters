
import React from "react";
import Layout from "@/components/Layout";

const Terms = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Podmienky používania webovej stránky Majstri.com</h1>
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Základné informácie</h2>
              <p className="text-gray-600">
                Tieto podmienky používania upravujú práva a povinnosti medzi prevádzkovateľom webovej stránky Majstri.com (dálej len "Platforma") a jej užívateľmi. Prevádzkovateľom Platformy je fyzická osoba, ktorá je dostupná na e-mailovej adrese: infomaj-stri.com
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Registrácia a vekové obmedzenia</h2>
              <p className="text-gray-600">
                Používanie Platformy je podmienené registráciou. Registrácia je povolená osobám starším ako 17 rokov. Pri registrácii sa od používateľa vyžaduje poskytnutie pravdivých údajov.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Typy používateľov</h2>
              <p className="text-gray-600 mb-3">Platforma rozlišuje dvoch hlavných používateľov:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Majster:</strong> poskytovateľ remeselných služieb</li>
                <li><strong>Zákazník:</strong> osoba, ktorá hľadá remeselné služby</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Obsah vytvorený používateľom</h2>
              <p className="text-gray-600">
                Užívatelia môžu nahrávať fotografie, texty a popisy svojich prác. Za obsah zodpovedá výlučne používateľ, ktorý ho vytvoril. Platforma môže odstrániť obsah, ktorý porušuje právne predpisy alebo podmienky platformy.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Hodnotenia a recenzie</h2>
              <p className="text-gray-600">
                Zákazníci môžu po ukončení práce ohodnotiť majstra. Recenzie budú moderované len v prípade, ak vznikne podozrenie, že boli písané s cieľom poškodiť reputáciu konkurencie.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Rezervácie a komunikácia</h2>
              <p className="text-gray-600">
                Platforma umožňuje zákazníkom rezervovať si termín u majstra prostredníctvom kalendára a chatu. Po rezervácii sa v chate zobrazuje notifikácia, ktorú majster potvrdí. Po potvrdení sa rezervácia objaví v sekcii "Zákazky".
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Zodpovednosť</h2>
              <p className="text-gray-600">
                Platforma poskytuje len sprostredkovanie kontaktu a rezervácií medzi zákazníkmi a majstrami. Nenesie zodpovednosť za kvalitu, rozsah alebo úspešnosť vykonaných prác. Používateľ je plne zodpovedný za svoje konanie.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Platby</h2>
              <p className="text-gray-600">
                V súčasnosti sa platby realizujú mimo Platformu. V budúcnosti môže byť zavedená funkcia spracovania platieb cez Platformu, o čom budú používatelia vopred informovaní.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Obmedzenie účtov</h2>
              <p className="text-gray-600">
                Prevádzkovateľ si vyhradzuje právo zablokovať alebo zrušiť účet používateľa, ktorý poruší tieto podmienky alebo znežužije funkcie Platformy.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Propagácia mimo Platformu</h2>
              <p className="text-gray-600">
                Majstri môžu slobodne propagovať svoje služby aj mimo Platformu.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">11. Ochrana osobných údajov (GDPR)</h2>
              <p className="text-gray-600">
                Platforma uchováva nasledovné osobné údaje: e-mail, telefónne číslo a lokalitu. Tieto údaje sú spracovávané v súlue so Zákonom o ochrane osobných údajov a budú doplnené v samostatnej Politike ochrany osobných údajov.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">12. Analytika a cookies</h2>
              <p className="text-gray-600">
                Platforma plánuje používanie analytických nástrojov a cookies v budúcnosti. Používatelia budú mať možnosť spravovať svoje nastavenia cookies.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">13. Záverečné ustanovenia</h2>
              <p className="text-gray-600">
                Tieto podmienky nadobúdajú účinnosť dňom ich zverejnenia na Platforme. Prevádzkovateľ si vyhradzuje právo tieto podmienky kedykoľvek zmeniť. O významných zmenách budú používatelia informovaní.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;

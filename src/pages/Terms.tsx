
import React from "react";
import Layout from "@/components/Layout";
import { Separator } from "@/components/ui/separator";

const Terms = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Podmienky používania webovej stránky Majstri.sk</h1>
        
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Základné informácie</h2>
            <p className="text-muted-foreground">
              Tieto podmienky používania upravujú práva a povinnosti medzi prevádzkovateľom webovej stránky Majstri.sk (ďalej len "Platforma") a jej užívateľmi. Prevádzkovateľom Platformy je fyzická osoba, ktorá je dostupná na e-mailovej adrese: <a href="mailto:dvidid35@gmail.com" className="text-primary hover:underline">dvidid35@gmail.com</a>.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Registrácia a věkové obmedzenie</h2>
            <p className="text-muted-foreground">
              Používanie Platformy je podmienené registráciou. Registrácia je povolená osobám starším ako 16 rokov. Pri registrácii sa od používateľa vyžaduje poskytnutie pravdivých údajov.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Typy používateľov</h2>
            <p className="text-muted-foreground">
              Platforma rozlišuje dvoch hlavných používateľov:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li><strong>Majster</strong>: poskytovateľ remeselných služieb,</li>
              <li><strong>Zákazník</strong>: osoba, ktorá hľadá remeselné služby.</li>
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Obsah vytvorený používateľom</h2>
            <p className="text-muted-foreground">
              Užívatelia môžu nahrávať fotografie, texty a popisy svojich prác. Za obsah zodpovedá výlučne používateľ, ktorý ho vytvoril. Platforma môže odstrániť obsah, ktorý porušuje právne predpisy alebo podmienky platformy.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Hodnotenia a recenzie</h2>
            <p className="text-muted-foreground">
              Zákazníci môžu po ukončení práce ohodnotiť majstra. Recenzie budú moderované len v prípade, ak vznikne podozrenie, že boli písané s cieľom poškodiť reputáciu konkurencie.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Rezervácie a komunikácia</h2>
            <p className="text-muted-foreground">
              Platforma umožňuje zákazníkom rezervovať si termín u majstra prostredníctvom kalendára a chatu. Po rezervácii sa v chate zobrazuje notifikácia, ktorú majster potvrdí. Po potvrdení sa rezervácia objaví v sekcii "Zákazky".
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Zodpovednosť</h2>
            <p className="text-muted-foreground">
              Platforma poskytuje len sprostredkovanie kontaktu a rezervácií medzi zákazníkmi a majstrami. Nenesie zodpovednosť za kvalitu, rozsah alebo úspešnosť vykonaných prác. Používateľ je plne zodpovedný za svoje konanie.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Platby</h2>
            <p className="text-muted-foreground">
              V súčasnosti sa platby realizujú mimo Platformu. V budúcnosti môže byť zavedená funkcia spracovania platieb cez Platformu, o čom budú používatelia vopred informovaní.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Obmedzenie účtov</h2>
            <p className="text-muted-foreground">
              Prevádzkovateľ si vyhradzuje právo zablokovať alebo zrušiť účet používateľa, ktorý poruší tieto podmienky alebo zneužije funkcie Platformy.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Propagácia mimo Platformu</h2>
            <p className="text-muted-foreground">
              Majstri môžu slobodne propagovať svoje služby aj mimo Platformu.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Ochrana osobných údajov (GDPR)</h2>
            <p className="text-muted-foreground">
              Platforma uchováva nasledovné osobné údaje: e-mail, telefónne číslo a lokalitu. Tieto údaje sú spracovávané v súlade so Zákonom o ochrane osobných údajov a budú doplnené v samostatnej Politike ochrany osobných údajov.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Analytika a cookies</h2>
            <p className="text-muted-foreground">
              Platforma plánuje používanie analytických nástrojov a cookies v budúcnosti. Používatelia budú mať možnosť spravovať svoje nastavenia cookies.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">13. Záverečné ustanovenia</h2>
            <p className="text-muted-foreground">
              Tieto podmienky nadobúdajú účinnosť dňom ich zverejnenia na Platforme. Prevádzkovateľ si vyhradzuje právo tieto podmienky kedykoľvek zmeniť. O významných zmenách budú používatelia informovaní.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;

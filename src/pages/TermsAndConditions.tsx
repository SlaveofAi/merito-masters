
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAccept = () => {
    navigate(user ? "/profile" : "/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/10">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Podmienky používania webovej stránky Majstri.com
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto text-sm">
          <div className="space-y-4">
            <section>
              <h3 className="font-bold text-lg">1. Základné informácie</h3>
              <p>
                Tieto podmienky používania upravujú práva a povinnosti medzi prevádzkovateľom webovej stránky Majstri.com (dálej len "Platforma") a jej užívateľmi. 
                Prevádzkovateľom Platformy je fyzická osoba, ktorá je dostupná na e-mailovej adrese: <a href="mailto:dvidid35@gmail.com" className="text-primary hover:underline">dvidid35@gmail.com</a>.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg">2. Registrácia a věkové obmedzenie</h3>
              <p>
                Používanie Platformy je podmienené registráciou. Registrácia je povolená osobám starším ako 16 rokov. 
                Pri registrácii sa od používateľa vyžaduje poskytnutie pravdivých údajov.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg">3. Typy používateľov</h3>
              <p>
                Platforma rozlišuje dvoch hlavných používateľov:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Majster</strong>: poskytovateľ remeselných služieb,</li>
                <li><strong>Zákazník</strong>: osoba, ktorá hľadá remeselné služby.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg">4. Obsah vytvorený používateľom</h3>
              <p>
                Užívatelia môžu nahrávať fotografie, texty a popisy svojich prác. Za obsah zodpovedá výlučne používateľ, 
                ktorý ho vytvoril. Platforma môže odstrániť obsah, ktorý porušuje právne predpisy alebo podmienky platformy.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg">5. Hodnotenia a recenzie</h3>
              <p>
                Zákazníci môžu po ukončení práce ohodnotiť majstra. Recenzie budú moderované len v prípade, 
                ak vznikne podozrenie, že boli písané s cieľom poškodiť reputáciu konkurencie.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg">6. Rezervácie a komunikácia</h3>
              <p>
                Platforma umožňuje zákazníkom rezervovať si termín u majstra prostredníctvom kalendára a chatu. 
                Po rezervácii sa v chate zobrazuje notifikácia, ktorú majster potvrdí. Po potvrdení sa rezervácia objaví v sekcii "Zákazky".
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg">7. Zodpovednosť</h3>
              <p>
                Platforma poskytuje len sprostredkovanie kontaktu a rezervácií medzi zákazníkmi a majstrami. 
                Nenesie zodpovednosť za kvalitu, rozsah alebo úspešnosť vykonaných prác. Používateľ je plne zodpovedný za svoje konanie.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg">8. Platby</h3>
              <p>
                V súčasnosti sa platby realizujú mimo Platformu. V budúcnosti môže byť zavedená funkcia spracovania platieb cez Platformu, 
                o čom budú používatelia vopred informovaní.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg">9. Obmedzenie účtov</h3>
              <p>
                Prevádzkovateľ si vyhradzuje právo zablokovať alebo zrušiť účet používateľa, ktorý poruší tieto podmienky alebo znežužije funkcie Platformy.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg">10. Propagácia mimo Platformu</h3>
              <p>
                Majstri môžu slobodne propagovať svoje služby aj mimo Platformu.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg">11. Ochrana osobných údajov (GDPR)</h3>
              <p>
                Platforma uchováva nasledovné osobné údaje: e-mail, telefónne číslo a lokalitu. 
                Tieto údaje sú spracovávané v súlue so Zákonom o ochrane osobných údajov a budú doplnené v samostatnej Politike ochrany osobných údajov.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg">12. Analytika a cookies</h3>
              <p>
                Platforma plánuje používanie analytických nástrojov a cookies v budúcnosti. 
                Používatelia budú mať možnosť spravovať svoje nastavenia cookies.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg">13. Záverečné ustanovenia</h3>
              <p>
                Tieto podmienky nadobúdajú účinnosť dňom ich zverejnenia na Platforme. 
                Prevádzkovateľ si vyhradzuje právo tieto podmienky kedykoľvek zmeniť. O významných zmenách budú používatelia informovaní.
              </p>
            </section>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center pb-6 pt-2">
          <Button onClick={handleAccept} size="lg">
            Súhlasím s podmienkami používania
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TermsAndConditions;

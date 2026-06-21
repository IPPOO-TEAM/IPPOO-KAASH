import { useState } from "react";
import Slider from "react-slick";
import { NavLink } from "react-router";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ArrowRight } from "lucide-react";
import imgCouturieres from "../../imports/deux-femmes-couturieres-africaines-ont-concu-nouvelle-robe-rouge-mannequin-au-bureau-tailleur_627829.png";
import imgCoiffeuses from "../../imports/afrique-coiffeuses-ambassadrices-sante-mentale-32825.png";
import imgEntrepreneur from "../../imports/68b80553772293aeca0e6de9_01_1.jpg";
import imgBlackGirls from "../../imports/Black_Girls.jpg";
import imgCommunaute from "../../imports/photo_12_2026-04-22_16-08-41.jpg";
import imgAssuranceVoyage from "../../imports/photo_6_2026-05-08_00-42-28.jpg";
import imgHopital from "../../imports/photo_11_2026-05-08_00-42-28.jpg";
import imgMarcheFruits from "../../imports/photo_26_2026-05-03_18-43-34.jpg";
import imgMecano from "../../imports/specialiste-bipoc-dans-service-automobile-utilisant-outils-mecaniques-professionnels-pour-reparer-systeme-allumage-casse-specialiste-agree-dans-reparation-automobiles-garage-garantissant-performances-automobiles-o.png";
import imgAgro from "../../imports/Closer_Africa-Europe_Collaboration_Needed_To_Deliver_Food_And_Nutrition_Security_Roadmap__Says_Leading_Research_Body.jpg";
import imgShopTroc from "../../imports/IPPOO_-_Shop___Troc___Agro_-_Alimentaire___Bien-_tre_23.png";
import imgAnniversaire from "../../imports/t_l_chargement_-_2026-02-09T204353.701.jpg";
import imgCeltiis from "../../imports/SLIDER_ASSO_TCHE-03__2_.jpeg";
import imgMtnSms from "../../imports/SMS-PRO__2_.jpg";
import imgEcobank from "../../imports/ecobank_ci_0.jpg";
import imgBusinessWoman from "../../imports/african-woman-successful-small-business-600nw-2745247757.jpg";
import imgShopping from "../../imports/trois-femmes-africaines-choisissent-vetements-lors-journee-magasinage_926199-2565282.jpg";
import imgPartner1 from "../../imports/images__9_.png";
import imgPartner2 from "../../imports/images_-_2026-04-10T163945.322.jpeg";
import imgPartner3 from "../../imports/images_-_2026-04-10T162222.523__2_.jpeg";

interface AdSlide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image: string;
}

const slides: AdSlide[] = [
  { id: 30, title: "Celtiis Illiminet Boosté", subtitle: "5000F = 11.6 Go pendant 30 jours. Tape *889# pour activer.", cta: "Recharger", link: "/pay/bills", image: imgCeltiis },
  { id: 31, title: "MTN SMS Pro", subtitle: "Contactez tous vos clients d'un seul SMS, où que vous soyez.", cta: "Activer", link: "/pay/bills", image: imgMtnSms },
  { id: 32, title: "Ecobank, The Pan African Bank", subtitle: "Liez votre compte Ecobank pour des transferts instantanés.", cta: "Connecter", link: "/wallet", image: imgEcobank },
  { id: 33, title: "Femmes entrepreneures", subtitle: "Encaissez les paiements de vos clientes en un scan.", cta: "Recevoir", link: "/receive", image: imgBusinessWoman },
  { id: 34, title: "Shoppez sans cash", subtitle: "Réglez vos achats en boutique sans manipuler de billets.", cta: "Découvrir", link: "/shop", image: imgShopping },
  { id: 35, title: "Partenaires IPPOO", subtitle: "Profitez d'offres exclusives chez nos partenaires.", cta: "Voir", link: "/", image: imgPartner1 },
  { id: 36, title: "Programme fidélité", subtitle: "Cumulez des points à chaque paiement et débloquez des récompenses.", cta: "En savoir plus", link: "/savings", image: imgPartner2 },
  { id: 37, title: "Réseau marchand IPPOO", subtitle: "Plus de 5 000 commerçants acceptent IPPOO-CASH au Bénin.", cta: "Trouver", link: "/shop", image: imgPartner3 },
  { id: 11, title: "Soutenez l'artisanat local", subtitle: "Payez vos couturières en un scan, sans frais.", cta: "Découvrir", link: "/shop", image: imgCouturieres },
  { id: 12, title: "Réservez votre coiffeuse", subtitle: "Payez en avance, gagnez du temps en salon.", cta: "Réserver", link: "/pay", image: imgCoiffeuses },
  { id: 13, title: "Boostez votre business", subtitle: "Outils pros pour entrepreneurs béninois.", cta: "Activer Pro", link: "/finance", image: imgEntrepreneur },
  { id: 14, title: "Femmes, prenez le pouvoir financier", subtitle: "Programme dédié à l'autonomie économique.", cta: "Rejoindre", link: "/savings", image: imgBlackGirls },
  { id: 15, title: "Plus forts ensemble", subtitle: "Rejoignez 50 000+ utilisateurs au Bénin.", cta: "Rejoindre", link: "/", image: imgCommunaute },
  { id: 16, title: "Assurance voyage & santé", subtitle: "Voyagez sereinement, protégés où que vous soyez.", cta: "Souscrire", link: "/investments", image: imgAssuranceVoyage },
  { id: 17, title: "Frais médicaux pris en charge", subtitle: "Hospitalisation et soins remboursés en quelques jours.", cta: "En savoir plus", link: "/savings", image: imgHopital },
  { id: 18, title: "Fruits & légumes au meilleur prix", subtitle: "Payez vos courses au marché en un scan.", cta: "Découvrir", link: "/shop", image: imgMarcheFruits },
  { id: 19, title: "Mécaniciens & garages", subtitle: "Réglez vos réparations en toute simplicité.", cta: "Trouver", link: "/pay", image: imgMecano },
  { id: 20, title: "Soutenez nos productrices", subtitle: "Investissez dans les filières agricoles locales.", cta: "Investir", link: "/investments", image: imgAgro },
  { id: 21, title: "Du champ à votre assiette", subtitle: "Produits agricoles locaux livrés chez vous.", cta: "Commander", link: "/shop", image: imgShopTroc },
  { id: 22, title: "Offrez un cadeau IPPOO", subtitle: "Anniversaire, fêtes : envoyez de l'argent autrement.", cta: "Offrir", link: "/transfers", image: imgAnniversaire },
];

const AUTOPLAY_MS = 4500;

export function AdsCarousel() {
  const [tick, setTick] = useState(0);
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: AUTOPLAY_MS,
    pauseOnHover: true,
    arrows: false,
    swipe: true,
    swipeToSlide: true,
    touchMove: true,
    draggable: true,
    touchThreshold: 8,
    adaptiveHeight: true,
    beforeChange: () => setTick((t) => t + 1),
  };

  return (
    <div className="relative ads-carousel">
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={slide.id}>
            <NavLink
              to={slide.link}
              className="block bg-white rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="block w-full h-auto"
                loading="lazy"
              />
              <div className="p-4 lg:p-5">
                <h3
                  style={{
                    color: "#0F172A",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    lineHeight: 1.25,
                  }}
                >
                  {slide.title}
                </h3>
                <p className="text-[13px] text-[#6B7280] mt-1" style={{ lineHeight: 1.45 }}>
                  {slide.subtitle}
                </p>
                <span
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] bg-[#00D4FF] text-white"
                  style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                >
                  {slide.cta} <ArrowRight size={14} />
                </span>
              </div>
            </NavLink>
          </div>
        ))}
      </Slider>
      <div className="mt-3 h-[3px] w-full rounded-full bg-black/5 overflow-hidden">
        <div
          key={tick}
          className="h-full rounded-full bg-gradient-to-r from-[#14B85A] to-[#00D4FF] ads-progress"
          style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
        />
      </div>
      <style>{`
        .ads-carousel .slick-slide > div { line-height: 0; }
        .ads-carousel .slick-list { touch-action: pan-y; transition: height 0.3s ease; }
        @keyframes adsProgress { from { width: 0%; } to { width: 100%; } }
        .ads-progress { width: 0%; animation-name: adsProgress; animation-timing-function: linear; animation-fill-mode: forwards; }
      `}</style>
    </div>
  );
}

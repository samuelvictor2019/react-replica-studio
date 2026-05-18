import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import formsHero from "@/assets/forms_hero.jpg";
import formsOne from "@/assets/forms1.jpg";
import formsTwo from "@/assets/form2.jpg";
import NewMemberRegistration from "./NewMemberRegistration";
import AltarCall from "./AltarCall";
import Testimony from "./Testimony";
import PreMaritalCounseling from "./PreMaritalCounseling";
import Counselling from "./Counselling";
import Volunteer from "./Volunteer";
import Feedback from "./Feedback";
import babyDedicationImg from "@/assets/community-1.jpg";
import babyNamingImg from "@/assets/community-1.jpg";
import testimonyImg from "@/assets/testimony.jpg";
import feedbackImg from "@/assets/feedback.jpg";
import altarCallImg from "@/assets/altarcall.jpg";
import firstTimerImg from "@/assets/firsttimer.jpg";
import volunteerImg from "@/assets/volunteer.jpg";
import preMaritalImg from "@/assets/premarital.jpg";
import eventRegistrationImg from "@/assets/community-1.jpg";
import counsellingImg from "@/assets/counseling.jpg";

type ModalKey = 'newMember' | 'altarCall' | 'testimony' | 'preMarital' | 'counselling' | 'volunteer' | 'feedback' | null;

const Forms = () => {
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const returnTo = useMemo(() => new URLSearchParams(location.search).get('returnTo') || '', [location.search]);

  const closeModal = () => {
    setActiveModal(null);
    navigate(returnTo || '/forms', { replace: true });
  };

  const formModalMap: Record<string, ModalKey> = {
    'First Timer Form': 'newMember',
    'Altar Call Form': 'altarCall',
    'Testimony Form': 'testimony',
    'Pre-Marital Counselling Form': 'preMarital',
    'Counselling Request': 'counselling',
    'Volunteer Form': 'volunteer',
    'Feedback / Suggestion Form': 'feedback',
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const form = params.get('form');

    if (form === 'first-timer') {
      setActiveModal('newMember');
    } else if (form === 'volunteer') {
      setActiveModal('volunteer');
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative bg-white">
        <div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-medium leading-tight text-black">
            We're here to
            <br />
            walk with you
          </h1>
        </div>

        <div className="w-full">
          <img src={formsHero} alt="Forms hero" className="w-full h-auto object-contain" />
        </div>
      </section>

      {/* Modal overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative z-50 mx-4 w-full max-w-3xl h-[calc(100dvh-2rem)] sm:h-auto sm:max-h-[90vh] overflow-hidden">
            {activeModal === 'newMember' && <NewMemberRegistration modal onClose={closeModal} />}
            {activeModal === 'altarCall' && <AltarCall modal onClose={closeModal} />}
            {activeModal === 'testimony' && <Testimony modal onClose={closeModal} />}
            {activeModal === 'preMarital' && <PreMaritalCounseling modal onClose={closeModal} />}
            {activeModal === 'counselling' && <Counselling modal onClose={closeModal} />}
            {activeModal === 'volunteer' && <Volunteer modal onClose={closeModal} />}
            {activeModal === 'feedback' && <Feedback modal onClose={closeModal} />}
          </div>
        </div>
      )}

      <section className="py-12 md:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] gap-6 items-start">
            <div>
              <h2 className="font-heading text-3xl md:text-5xl font-medium text-foreground leading-tight mb-5">
                We're here to
                <br />
                walk with you
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-3">
                This page brings together important forms that help us serve you better—whether you're celebrating a milestone, taking a next step, or sharing what God has done.
              </p>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Select the form that applies to you, and we'll take it from there.
              </p>
            </div>

            <div>
              <div className="relative mb-6">
                <div className="p-6 rounded-md max-w-[360px] ml-auto mt-0 relative z-10">
                  <p className="text-sm text-foreground/80 font-medium mb-2">Support for every season</p>
                  <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                    Simple steps that help us walk with you
                    <br />
                    through every season.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image bleeding to right edge */}
        <div className="mt-10 ml-4 md:ml-[max(3rem,calc((100vw-64rem)/2+3rem))]">
          <div className="overflow-hidden rounded-l-[18px]">
            <img src={formsOne} alt="community" className="w-full h-[260px] md:h-[380px] object-cover" />
          </div>
        </div>
      </section>

      {/* Forms Grid */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="font-heading text-4xl md:text-6xl font-medium text-black text-center leading-[0.95] max-w-[640px] mx-auto mb-4">
            Connecting You to
            <br />
            Care, Celebration,
            <br />
            and Community
          </h2>
          <p className="text-sm text-black/70 text-center max-w-md mx-auto leading-snug mb-8">Select the form that applies to you, and we'll take it from there. Your submissions are treated with care, prayer, and confidentiality.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
            {[
              { title: 'Feedback / Suggestion Form', desc: "Your voice matters to us. Help us grow and serve better by sharing your feedback, thoughts, or suggestions.", action: 'SEND FEEDBACK →'},
              { title: 'Altar Call Form', desc: "If you gave your life to Christ or need pastoral support, fill this form so we can follow up and walk with you.", action: 'ALTAR CALL FORM →'},
              { title: 'Testimony Form', desc: "Has God done something beautiful in your life? Share your testimony so it can encourage others and glorify God among His people.", action: 'SHARE YOUR TESTIMONY →'},
              { title: 'Volunteer Form', desc: "Ready to serve? Tell us where you feel led and we'll help you find a place to serve.", action: 'BECOME A VOLUNTEER →'},
              { title: 'Pre-Marital Counselling Form', desc: "Preparing for marriage is a sacred journey. This form helps us connect you with premarital counselling and guidance.", action: 'REQUEST COUNSELLING →'},
              { title: 'First Timer Form', desc: "Thank you for worshipping with us! Let us know you're connected and help us welcome you.", action: "I'M A FIRST TIMER →"},
              { title: 'Counselling Request', desc: "If you need pastoral guidance, counselling, or spiritual support, tell us here so we can reach out pastorally and biblically.", action: 'REQUEST COUNSELLING →'},
            ].map((f) => (
              <div key={f.title} className="rounded-lg p-4 max-w-[260px] md:max-w-[250px] mx-auto min-h-[410px] md:min-h-[440px]">
                <div className="w-full h-44 md:h-52 bg-slate-100 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                  <img 
                    src={
                      f.title === 'Baby Dedication Form' ? babyDedicationImg :
                      f.title === 'Baby Naming Form' ? babyNamingImg :
                      f.title === 'Testimony Form' ? testimonyImg :
                      f.title === 'Feedback / Suggestion Form' ? feedbackImg :
                      f.title === 'Altar Call Form' ? altarCallImg :
                      f.title === 'First Timer Form' ? firstTimerImg :
                      f.title === 'Volunteer Form' ? volunteerImg :
                      f.title === 'Pre-Marital Counselling Form' ? preMaritalImg :
                      f.title === 'Event Registration' ? eventRegistrationImg :
                      f.title === 'Counselling Request' ? counsellingImg :
                      'https://via.placeholder.com/150'
                    } 
                    alt={`${f.title} image`} 
                    className="object-cover w-full h-full" 
                  />
                </div>
                <h3 className="font-medium text-black mb-2">{f.title}</h3>
                <p className="text-sm text-black/70 mb-3">{f.desc}</p>
                {formModalMap[f.title] ? (
                  <button onClick={() => setActiveModal(formModalMap[f.title])} className="text-sm text-sky-500 font-semibold">{f.action}</button>
                ) : (
                  <a href="#" className="text-sm text-sky-500 font-semibold">{f.action}</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Submission Notice Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="flex flex-col md:flex-row items-center">
          <div className="order-2 md:order-1 flex-1 px-4 md:pl-[max(2rem,calc((100vw-64rem)/2+2rem))] md:pr-10">
            <h2 className="font-heading text-4xl md:text-5xl font-medium text-foreground mb-4">Form Submission Notice</h2>
            <p className="text-sm text-muted-foreground max-w-md">Some forms require pastoral confirmation before approval. Submitting a form does not automatically confirm scheduling or placement.</p>
          </div>

          <div className="order-1 md:order-2 md:w-[45%] overflow-hidden rounded-l-[18px] mb-8 md:mb-0">
            <img src={formsTwo} alt="form notice" className="w-full h-40 md:h-56 object-cover" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Forms;

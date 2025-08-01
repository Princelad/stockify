import "./Landing.css";
import DarkVeil from "@/Backgrounds/DarkVeil/DarkVeil";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import SplitText from "@/TextAnimations/SplitText/SplitText";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="landing-root">
      <div className="landing-bg">
        <DarkVeil />
      </div>
      <div className="landing-content">
        <Navbar />
        <div className="flex flex-col text-white space-y-5">
          <SplitText
            text="Stockify"
            className="text-9xl font-semibold text-center "
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <p className="w-[60%] text-center mx-auto">
            Stockify is designed as a minimal but comprehensive open-source
            solution for stock management and billing, specifically tailored for
            small and medium-sized businesses.
          </p>
          <Link to="/login">
            <div className="flex justify-center">
              <Button className="text-lg">
                Get Started <span style={{ marginLeft: "0.5em" }}>→</span>
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;

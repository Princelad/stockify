import LightRays from "@/Backgrounds/LightRays/LightRays";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import SplitText from "@/TextAnimations/SplitText/SplitText";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="w-screen h-screen static overflow-hidden">
      <div className="absolute inset-0 z-[1] bg-[#181825]">
        <LightRays
          raysOrigin="top-center"
          raysColor="#2563eb"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>
      <div className="relative z-[2] flex justify-center items-center h-full">
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
              <Button className="text-lg bg-blue-600">
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

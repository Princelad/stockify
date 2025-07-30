import './Landing.css';
import DarkVeil from '@/Backgrounds/DarkVeil/DarkVeil';
import Navbar from '@/components/ui/Navbar';

function Landing() {
    return (
        <div className="landing-root">
            <div className="landing-bg">
                <DarkVeil />
            </div>
            <div className="landing-content">
                <Navbar />
                <div className="flex text-white space-x-5">
                    <div className="w-[30vw]">
                        
                    </div>
                    <div className="w-[65vw]">
                        
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Landing;

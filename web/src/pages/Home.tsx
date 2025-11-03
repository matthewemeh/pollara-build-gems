import { CgPoll } from 'react-icons/cg';
import { IoStatsChart } from 'react-icons/io5';
import { RiChatPollFill } from 'react-icons/ri';
import { LiaUsersSolid } from 'react-icons/lia';
import { PiUserSoundFill } from 'react-icons/pi';
import { TbReportAnalytics } from 'react-icons/tb';
import { FcComboChart, FcSurvey, FcMindMap } from 'react-icons/fc';

import { LinkButton } from '../components';
import { PATHS } from '../routes/PathConstants';

const Home = () => {
  return (
    <main className='px-[4.44%] pb-29'>
      <section className='flex flex-col items-center justify-between h-fit lg:flex-row lg:items-start'>
        <div className='main info-container mt-16 max-w-140 lg:mt-48'>
          <h1 className='heading'>Create and share polls effortlessly with Pollara</h1>
          <p className='sub-heading'>
            Pollara helps you collect opinions, make decisions, and understand people better — all
            in a few simple steps.
          </p>
        </div>
        <div className='relative -mt-20 -mb-10 lg:mb-0 lg:mt-14 max-lg:scale-[0.5697329376]'>
          <FcMindMap className='w-168.5 h-[563px]' />
          <CgPoll className='hero-icon top-[11%] left-[calc(50%-30px)]' />
          <IoStatsChart className='hero-icon top-[42%] left-[calc(50%-46px)] !size-24' />
          <PiUserSoundFill className='hero-icon top-[21%] left-[16%]' />
          <RiChatPollFill className='hero-icon bottom-[9%] left-[22.5%]' />
          <TbReportAnalytics className='hero-icon bottom-[13%] right-[27.7%]' />
          <LiaUsersSolid className='hero-icon top-[39%] right-[19%]' />
        </div>
      </section>

      <section className='flex flex-col-reverse items-center justify-between lg:flex-row lg:items-start'>
        <div className='mt-12 lg:mt-18'>
          <FcComboChart className='size-64 lg:w-[593px] lg:h-145' />
        </div>
        <div className='info-container max-w-[557px] lg:mt-60'>
          <h2 className='heading'>Engage your audience in real time</h2>
          <p className='sub-heading'>
            Create interactive polls that capture real-time responses and spark meaningful
            conversations — anytime, anywhere.
          </p>
        </div>
      </section>

      <section className='flex flex-col-reverse items-center justify-between lg:flex-row lg:items-start lg:gap-10 pl-[8.89%] pr-[5.56%]'>
        <div className='mt-14 lg:mt-32'>
          <FcSurvey className='size-64 lg:w-[521px] lg:h-[477px]' />
        </div>
        <div className='info-container mt-16 max-w-[557px] lg:mt-44'>
          <h3 className='heading'>Analyze insights that matter</h3>
          <p className='sub-heading'>
            Pollara's detailed analytics help you visualize results, identify trends, and make
            smarter data-driven decisions.
          </p>
        </div>
      </section>

      <section className='info-container mt-24 items-center gap-5'>
        <p className='register-text heading text-center !text-storm-dust'>
          Start creating polls that inspire participation and reveal powerful insights.
          <br />
          <em className='text-port-gore'>Join Pollara today!</em>
        </p>
        <LinkButton to={PATHS.AUTH.REGISTER_USER} variant='contained' size='large'>
          Get Started
        </LinkButton>
      </section>
    </main>
  );
};

export default Home;

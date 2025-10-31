import { Link } from 'react-router-dom';
import { PATHS } from '../routes/PathConstants';

const PrivacyPolicy = () => {
  return (
    <div className='privacy'>
      <div className='max-w-3xl mx-auto'>
        <h1 className='text-3xl font-bold mb-6 text-center'>Privacy Policy</h1>

        <p>
          Thomaz Frank built the <strong>POLLARA</strong> app as a Free app. This SERVICE is
          provided by Thomaz Frank at no cost and is intended for use as is.
        </p>

        <p className='mt-4'>
          This page is used to inform visitors regarding my policies with the collection, use, and
          disclosure of Personal Information if anyone decides to use my Service.
        </p>

        <p className='mt-4'>
          You consent to the collection and use of information in accordance with this policy if you
          decide to use my Service. The purpose of the personal data I gather is to deliver and
          enhance the service. Unless otherwise specified in this Privacy Policy, I will not use or
          disclose your information to third parties.
        </p>

        <h2 className='text-xl font-semibold mt-6 mb-2'>Information Collection and Use</h2>
        <p>
          For a better experience, while using our Service, I may require you to provide us with
          certain personally identifiable information. The information that I request will be stored
          securely in our database servers.
        </p>

        <h2 className='text-xl font-semibold mt-6 mb-2'>Log Data</h2>
        <p>
          I would like to notify you that whenever you use my Service, I may collect data and
          information on your phone called Log Data (through third-party products) in the event that
          there is an error in the app. Information like your device's Internet Protocol ("IP")
          address, device name, operating system version, app configuration while using my service,
          the time and date of your service usage, and other statistics may be included in this log
          data.
        </p>

        <h2 className='text-xl font-semibold mt-6 mb-2'>Cookies</h2>
        <p>
          Cookies are files with a small amount of data that are commonly used as anonymous unique
          identifiers. These are sent to your browser from the websites that you visit and are
          stored on your device's internal memory.
        </p>

        <p className='mt-4'>
          This Service does not use these “cookies” explicitly. However, the app may use third party
          code and libraries that use “cookies” to collect information and improve their services.
          You have the option to either accept or refuse these cookies and know when a cookie is
          being sent to your device. If you choose to refuse our cookies, you may not be able to use
          some portions of this Service.
        </p>

        <h2 className='text-xl font-semibold mt-6 mb-2'>Service Providers</h2>
        <p>I may employ third-party companies and individuals due to the following reasons:</p>
        <ul className='list-disc pl-6 mt-2'>
          <li>To facilitate our Service;</li>
          <li>To provide the Service on our behalf;</li>
          <li>To perform Service-related services; or</li>
          <li>To assist us in analyzing how our Service is used.</li>
        </ul>

        <p className='mt-4'>
          I want to inform users of this Service that these third parties have access to your
          Personal Information. The reason is to perform the tasks assigned to them on our behalf.
          However, they are obligated not to disclose or use the information for any other purpose.
        </p>

        <h2 className='text-xl font-semibold mt-6 mb-2'>Security</h2>
        <p>
          I value your trust in providing us your Personal Information, thus we are striving to use
          commercially acceptable means of protecting it. But remember that no method of
          transmission over the internet, or method of electronic storage is 100% secure and
          reliable, and I cannot guarantee its absolute security.
        </p>

        <h2 className='text-xl font-semibold mt-6 mb-2'>Links to Other Sites</h2>
        <p>
          This Service may contain links to other sites. If you click on a third-party link, you
          will be directed to that site. Note that these external sites are not operated by me.
          Therefore, I strongly advise you to review the Privacy Policy of these websites. I have no
          control over and assume no responsibility for the content, privacy policies, or practices
          of any third-party sites or services.
        </p>

        <h2 className='text-xl font-semibold mt-6 mb-2'>Children's Privacy</h2>
        <p>
          No one under the age of 18 is to be served by these Services. I don't intentionally gather
          personally identifiable information from minors younger than 18. If I find out that a
          minor under the age of 18 has given me personal information, I immediately remove it from
          our servers. In order for me to take the appropriate action, if you are a parent or
          guardian and you know that your child has given us personal information, please get in
          touch with me.
        </p>

        <h2 className='text-xl font-semibold mt-6 mb-2'>Changes to This Privacy Policy</h2>
        <p>
          Occasionally, I might make changes to our Privacy Policy. As a result, you are encouraged
          to check this page from time to time for any updates. Any updates will be communicated to
          you by posting the updated Privacy Policy on this page.
        </p>
        <p className='mt-2'>This policy is effective as of 2025-10-30.</p>

        <h2 className='text-xl font-semibold mt-6 mb-2'>Contact Us</h2>
        <p>
          If you have any questions or suggestions about my Privacy Policy, you can contact me
          at&nbsp;
          <Link to='mailto:thomazfrank69@gmail.com' className='text-primary-600 underline'>
            thomazfrank69@gmail.com
          </Link>
          .
        </p>

        <div className='text-center mt-10'>
          <Link to={PATHS.DASHBOARD} className='text-primary-600 underline'>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

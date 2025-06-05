import { Link } from 'react-router'

const Spooktoberfest = () => {
  return (
    <div className='spooktoberfest-page'>
      <div className='page-header'>
        <div>
          <h1>Spooktoberfest</h1>
          <h2 className='coelbren-subheading'>(&#xE03B;&#xE012;&#xE009;&#xE009;&#xE017;&#xE01B;&#xE009;&#xE00D;&#xE033;&#xE026;&#xE015;&#xE033;&#xE03B;&#xE01B;)</h2>
          <h2 className='subheading'>October 9th - 12th, 2025</h2>
          <div className='bottom-border' />
        </div>
        <Link to='/'>
          <div className='back-navigation'>&#xE000; Go Back</div> 
        </Link>
      </div>
      <center>
        <p>&#6821;</p>
        <p>Spooktoberfest is a (now annual) celebration of the season, combining Oktoberfest, Halloween, the Autumn Equinox, and, less importantly, Ryan's birthday into a single weekend of fun and merriment.</p>
        <p>&#10087;</p>
      </center>
      <main>
        <h2>What To Expect</h2>

        <h3>Fanfare</h3>
        <p>Though we'll plan some group outings—with more details to come as we get closer to the event—you're of course welcome to enjoy your time as you wish.</p>
        <p>Popular northwoods activities include:</p>
        <ul>
          <li>Hiking</li>
          <li>Hanging out around a fire</li>
          <li>Kicking it on, at, or by any one of the countless lakes in the area</li>
          <li>Patronizing the local watering holes (Buckshot's on Hwy 45 is a good one)</li>
          <li>Board games, cards, etc.</li>
          <li>Rent a boat?? We can do this if the weather is nice enough and enough people are interested</li>
        </ul>

        <h3>Food</h3>
        <p>We're tentatively planning on going out for dinner on Thursday and Friday nights to <a href='https://buckshotseagleriver.com/buckshots-saloon-and-eatery/' rel='noopener noreferrer' target='_blank'>Buckshot's</a> and <a href='https://www.thecraftsmanamericantavern.com/' rel='noopener noreferrer' target='_blank'>The Craftsman</a>, respectively. On Saturday, we can do an evening fire and grill-a-thon back at the cabin.</p>
        <p>For breakfasts and lunch, our ask would be that all attending parties plan to make or bring at least one meal for all to share. We'll have a signup sheet for specific meals once we get closer to the event and know how many people will be attending.</p>

        <h3>Sleeping Arrangements</h3>
        <p>The cabin can comfortably sleep six (two in the primary bedroom, two in the loft, and two on the sleeper sofa), but with as many as eleven people staying overnight on any given night, we may have to get cozy with air mattresses and sleeping bags elsewhere in the space.</p>
        <p>Alternatively, <strong>you're welcome to bring a tent and camp on the land.</strong> Please let us know if you plan to do this so we can get a better feel for how to set up the cabin interior to support those who choose to sleep indoors.</p>

        <h2>Who To Expect</h2>

        <p>You, hopefully!</p>
        <p>As a reminder, we ask that you RSVP to Ryan and *confirm which days/nights you plan to attend* by September 9th.</p>

        <h2>When To Expect It</h2>

        <p>Spooktoberfest will run from Thursday, October 9th through Sunday, October 12th, 2025.</p>
        <p>You're welcome to stay as many nights as you'd like in that window, with the final departures on Sunday the 12th.</p>

        <h2>Where To Expect It</h2>

        <p>The address for The Druids Den was on the physical invite you received in the mail. We can of course text you the address if you need it again.</p>
        <p>We did submit our address to Google Maps and Apple Maps so that it (hopefully) appears in those apps prior to October, but if it does not, we'll reach out to share the best directions at that time.</p>

        <h2>More to Come</h2>
        <p>We'll have more updates as we get closer to the kickoff of Spooktoberfest 2025.</p>
        <p>In the meantime, if you have any questions or curiosities, don't hesitate to contact either Ryan or Lacey.</p>
      </main>

    </div>
  )
}

export default Spooktoberfest

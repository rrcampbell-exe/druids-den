import { Link } from 'react-router'
import { Coelbren, Flower, Leaf, Awen } from '../components'

const Spooktoberfest = () => {
  return (
    <div className='spooktoberfest-page'>
      <div className='page-header'>
        <div>
          <h1>Spooktoberfest</h1>
          <Coelbren
            renderAs='h2'
            className='coelbren-subheading' 
          >
            (Spooktoberfest)
          </Coelbren>
          <h2 className='subheading'>October 9th - 12th, 2025</h2>
          <div className='bottom-border' />
        </div>
        <Link to='/'>
          <div className='back-navigation'><Awen /> Go Back</div> 
        </Link>
      </div>
      <center>
        <Flower />
        <p>Spooktoberfest is a (now annual) celebration of the season, combining Oktoberfest, Halloween, the Autumn Equinox, and, less importantly, Ryan's birthday into a single weekend of fun and merriment.</p>
        <Leaf />
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
          <li>Patronizing the local watering holes (Buckshot's on Hwy 45 is a good one, as is Brew's Pub up in Land O' Lakes)</li>
          <li>Board games, cards, etc.</li>
          <li>Rent a boat?? We can do this if the weather is nice enough and enough people are interested</li>
        </ul>

        <h3>Food</h3>
        <p>We're tentatively planning on going out for dinner on Thursday and Friday nights to <a href='https://buckshotseagleriver.com/buckshots-saloon-and-eatery/' rel='noopener noreferrer' target='_blank'>Buckshot's</a> and <a href='https://www.thecraftsmanamericantavern.com/' rel='noopener noreferrer' target='_blank'>The Craftsman</a>, respectively. On Saturday, we can do an evening fire and grill-a-thon back at the cabin.</p>
        <p>For breakfasts and lunch, our ask would be that all attending parties plan to make or bring at least one meal for all to share. We'll get a text chain going closer to the event to sort that out in more detail.</p>

        <h3>Sleeping Arrangements</h3>
        <p>The cabin can comfortably sleep six (two in the primary bedroom, two in the loft, and two on the air mattress), but with as many as eight people staying overnight (Saturday), we'll get cozy with an additional air mattress set up in the space.</p>
        <p>Alternatively, <strong>you're welcome to bring a tent and camp on the land.</strong> Please let us know if you plan to do this so we can get a better feel for how to set up the cabin interior to support those who choose to sleep indoors.</p>

        <h2>When To Expect It</h2>

        <p>Spooktoberfest will run from Thursday, October 9th through Sunday, October 12th, 2025.</p>
        <p>You're welcome to stay as many nights as you'd like in that window, with the final departures on Sunday the 12th.</p>

        <h2>Where To Expect It</h2>

        <p>The address for The Druids Den was on the physical invite you received in the mail. We can of course text you the address if you need it again.</p>
        <p>Apple Maps does now feature our address and we did submit it to Google Maps as well, but if it doesn't appear there by October and you need to use Google Maps, let us know and we'll share the best directions at that time.</p>

        <h2>More to Come</h2>
        <p>We'll have more updates as we get closer to the kickoff of Spooktoberfest 2025.</p>
        <p>In the meantime, if you have any questions or curiosities, don't hesitate to contact either Ryan or Lacey.</p>
      </main>

    </div>
  )
}

export default Spooktoberfest

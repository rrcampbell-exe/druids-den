import { ArrowLink, AssetIcon, CoelbrenLabel, Meta, PageFrame } from '../components/site/SiteComponents'
import './Guide.scss'

const GuideSection = ({ id, index, title, icon, children, className = '' }) => (
  <section id={id} className={`guide-section ${className}`}>
    <div className='guide-section-heading'>
      <span className='guide-section-index'>{index}</span>
      <AssetIcon name={icon} alt='' />
      <h2>{title}</h2>
    </div>
    <div className='guide-section-content'>{children}</div>
  </section>
)

const GuideLink = ({ href, children }) => <a href={href} className='guide-quick-link'>{children}<span aria-hidden='true'>-&gt;</span></a>

export const Guide = () => (
  <PageFrame className='guide-page'>
    <Meta title='Guest Guide | The Druids Den' description='Everything you need for a comfortable stay at The Druids Den, including arrival, Wi-Fi, safety, and checkout information.' />
    <main>
      <section className='guide-hero' aria-labelledby='guide-title'>
        <div>
          <span className='guide-hero-eyebrow'>A practical guide</span>
          <CoelbrenLabel>Guest guide</CoelbrenLabel>
          <h1 id='guide-title'>Welcome to the Den.</h1>
          <p>Everything you need for a comfortable stay at the Den.</p>
        </div>
      </section>

      <section className='guide-critical' aria-labelledby='critical-title'>
        <div className='guide-critical-heading'>
          <span className='guide-hero-eyebrow'>The short path</span>
          <h2 id='critical-title'>Start with what matters.</h2>
        </div>
        <div className='guide-critical-links'>
          <GuideLink href='#wifi'>Find Wi-Fi details</GuideLink>
          <GuideLink href='#arrival'>Review arrival</GuideLink>
          <GuideLink href='#high-water'>High-water alarm</GuideLink>
          <GuideLink href='#emergency'>Emergency information</GuideLink>
          <GuideLink href='#checkout'>Review checkout</GuideLink>
        </div>
      </section>

      <div className='guide-content'>
        <GuideSection id='wifi' index='01' title='Wi-Fi' icon='01-constellation.png' className='guide-section-wifi'>
          <p className='guide-lead'>Find the Wi-Fi network name and password in your reservation arrival information and in the cabin. You can also find it posted on the refrigerator and in the loft.</p>
          <p className='guide-lead'>Cell reception can be spotty. Download anything you need before heading into the woods.</p>
        </GuideSection>

        <GuideSection id='arrival' index='02' title='Arrival' icon='crow.png'>
          <div className='guide-two-column'>
            <div>
              <h3>Check-in</h3>
              <p>Check-in begins at 4 p.m. Follow the arrival instructions provided for your reservation.</p>
            </div>
            <div>
              <h3>Parking</h3>
              <p>Up to four vehicles, including trailers, may park on the driveway or designated parking pad. Winter snow can reduce usable parking space.</p>
              <h3>Entry & first steps</h3>
              <p>Once inside, allow the radiant floor heat time to respond.</p>
            </div>
          </div>
        </GuideSection>

        <GuideSection id='high-water' index='03' title='High-water alarm' icon='duck.png'>
          <p className='guide-lead'>If the septic system's high-water alarm sounds, follow these steps.</p>
          <ol className='guide-checkout-list'>
            <li><span>01</span>Find the wall-mounted alarm beneath the NTI boilers in the utility room.</li>
            <li><span>02</span><div>Press the button labeled <strong>SILENCE</strong>.</div></li>
            <li><span>03</span>Notify the guest-support contact in your reservation information immediately, even if the alarm stays quiet.</li>
          </ol>
          <p className='guide-muted'>Silencing the sound does not resolve the warning.</p>
          <a className='text-link' href='/assets/pdfs/Druids-Den-High-Water-Warning.pdf' download>Download the high-water warning instructions (PDF)</a>
        </GuideSection>

        <GuideSection id='projector' index='04' title='Projector setup' icon='moon.png'>
          <p className='guide-lead'>Watch one of the supplied DVDs or connect your compatible device for movie night. For streaming, connect your compatible device to the internet and to the projector using the appropriate cable or adapter.</p>
          <ol className='guide-checkout-list'>
            <li><span>01</span>Plug in the cart's power strip beneath the bookshelf and switch it on.</li>
            <li><span>02</span>Place the projector on the cart's top shelf and remove the lens cap.</li>
            <li><span>03</span>Connect the cords from the wicker box: yellow tag to the projector, blue tag to the DVD player or your device, and unmarked to the power strip.</li>
            <li><span>04</span>Power on the projector and connected device, adjust focus and keystone, then press the Source button and select HDMI.</li>
            <li><span>05</span>Find the remotes in the wicker box. Return the equipment and cords after use.</li>
          </ol>
          <a className='text-link guide-download-link' href='/assets/pdfs/Druids-Den-Projector-Setup.pdf' download>Download the projector setup PDF</a>
        </GuideSection>

        <GuideSection id='comfort' index='05' title='Heat & comfort' icon='great-horned-owl.png'>
          <p className='guide-lead'>The cabin is designed to keep warm in the winter months. If changes are required, start with the thermostat, then use the fireplace for atmosphere and an extra layer of warmth.</p>
          <div className='guide-instruction-list'>
            <details open>
              <summary>Radiant floor heating</summary>
              <p>Give the floors time. Small temperature changes work better than large swings. Wear socks and let the system do its slow, steady thing.</p>
            </details>
            <details>
              <summary>Thermostat</summary>
              <p>Use the thermostat for the room temperature you want. If the cabin feels cool, check the setting first and give it time before adjusting again.</p>
            </details>
            <details>
              <summary>Gas fireplace</summary>
              <p>Use the fireplace for warmth and ambiance. Do <strong>not</strong> leave it running when you leave the cabin or go to sleep.</p>
            </details>
          </div>
        </GuideSection>

        <GuideSection id='kitchen' index='06' title='Kitchen' icon='acorn.png'>
          <div className='guide-two-column'>
            <div>
              <h3>Appliances</h3>
              <p>Refrigerator, electric range and oven, microwave, and dishwasher.</p>
            </div>
            <div>
              <h3>Cookware & coffee maker</h3>
              <p>Cookware, a coffee maker, and a kettle are available in the kitchen.</p>
            </div>
          </div>
        </GuideSection>

        <GuideSection id='water' index='07' title='Water & septic' icon='duck.png'>
          <p className='guide-lead'>You don't need to understand the cabin's mechanical systems. Just keep the system light on its feet.</p>
          <ul className='guide-check-list'>
            <li>Only flush toilet paper and normal waste.</li>
            <li>Keep wipes, paper towels, grease, and other products out of the drains.</li>
            <li>Use the guest-support contact in your reservation information if a drain, toilet, or water fixture behaves unexpectedly.</li>
          </ul>
        </GuideSection>

        <GuideSection id='fire' index='08' title='Fire' icon='single-mushroom.png'>
          <div className='guide-two-column'>
            <div>
              <h3>Fireplace</h3>
              <p>Follow the fireplace instructions in the cabin. Keep anything flammable away from the unit and turn it off before bed or departure.</p>
            </div>
            <div>
              <h3>Fire pit</h3>
              <p>Use the outdoor fire pit only when conditions permit. Keep the fire attended and fully extinguish it with water before leaving it.</p>
            </div>
          </div>
          <div className='guide-note guide-note-urgent'>
            <strong>Safety first</strong>
            <span>The fire extinguisher can be found under the kitchen sink. Call 911 for an emergency.</span>
          </div>
        </GuideSection>

        <GuideSection id='around' index='09' title='Around the cabin' icon='doe.png'>
          <div className='guide-two-column'>
            <div>
              <h3>Wildlife</h3>
              <p>Deer and turkeys are frequent neighbors. Store food properly, do not leave scraps outdoors, and give wildlife room.</p>
            </div>
            <div>
              <h3>Outside things</h3>
              <p>The covered porch, patio, grill, fire pit, and back lot are yours to enjoy. Wear sturdy footwear and check for ticks after time in the woods.</p>
            </div>
          </div>
        </GuideSection>

        <GuideSection id='explore' index='10' title='Explore' icon='buck.png'>
          <p className='guide-lead'>Use these regional resources to plan a day on the road or trails.</p>
          <div className='guide-explore-links'>
            <ArrowLink href='https://511wi.gov/'>Wisconsin 511 road conditions</ArrowLink>
            <ArrowLink href='https://www.vilascountywi.gov/departments/services/parks_and_recreation/trails___recreational_opportunities/snowmobile_trails.php'>Vilas County snowmobile trail information</ArrowLink>
            <ArrowLink href='https://www.vilascountywi.gov/departments/services/parks_and_recreation/trails___recreational_opportunities/atv_trails.php'>Vilas County ATV and UTV trails</ArrowLink>
            <ArrowLink to='/northwoods'>Open the full field guide</ArrowLink>
          </div>
        </GuideSection>

        <GuideSection id='recreation' index='11' title='Outdoor recreation rules' icon='buck.png'>
          <p className='guide-lead'>Use current Wisconsin DNR guidance for burning, hunting, fishing, boating, snowmobiling, and ATV/UTV use. Rules and restrictions can change.</p>
          <div className='guide-explore-links'>
            <ArrowLink href='https://dnr.wisconsin.gov/topic/forestfire/permits'>Burning permits and fire conditions</ArrowLink>
            <ArrowLink href='https://dnr.wisconsin.gov/topic/Hunt'>Hunting regulations and seasons</ArrowLink>
            <ArrowLink href='https://dnr.wisconsin.gov/topic/Fishing'>Fishing regulations and seasons</ArrowLink>
            <ArrowLink href='https://dnr.wisconsin.gov/topic/Boat'>Boating regulations and safety</ArrowLink>
            <ArrowLink href='https://dnr.wisconsin.gov/topic/Snowmobile'>Snowmobile regulations and trails</ArrowLink>
            <ArrowLink href='https://dnr.wisconsin.gov/topic/atv'>ATV/UTV regulations and safety</ArrowLink>
          </div>
          <a className='text-link guide-download-link' href='/assets/pdfs/Druids-Den-Outdoor-Recreation-Regulations.pdf' download>Download the outdoor recreation guide PDF</a>
        </GuideSection>

        <GuideSection id='emergency' index='12' title='Emergency' icon='raven.png' className='guide-section-emergency'>
          <div className='guide-emergency-grid'>
            <div>
              <span>Emergency services</span>
              <strong>911</strong>
              <p>Call 911 in an emergency. Use the cabin address in your arrival information or posted cabin instructions.</p>
            </div>
            <div>
              <span>Guest support</span>
              <strong>Contact in your reservation</strong>
              <p>For guest support, use the contact information provided with your reservation.</p>
            </div>
            <div>
              <span>Fire extinguishers</span>
              <strong>Under the kitchen sink</strong>
              <p>Locate them when you arrive so you do not need to look in a hurry.</p>
            </div>
          </div>
        </GuideSection>

        <GuideSection id='checkout' index='13' title='Checkout' icon='pinecone.png' className='guide-section-checkout'>
          <p className='guide-lead'>Checkout is at 10 a.m. Follow the departure instructions provided for your reservation.</p>
          <div className='guide-checkout-end'>
            <CoelbrenLabel>Until next time</CoelbrenLabel>
            <p>Thank you for caring for the den. The woods will remember.</p>
          </div>
        </GuideSection>
      </div>
    </main>
  </PageFrame>
)
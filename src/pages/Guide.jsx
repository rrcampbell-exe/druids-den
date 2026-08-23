import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLink, AssetIcon, CoelbrenLabel, Meta, SiteFooter, SiteHeader } from '../components/site/SiteComponents'
import './Guide.scss'

const privateAddress = import.meta.env.VITE_GUIDE_ADDRESS || 'Shared privately before arrival'
const wifiNetwork = import.meta.env.VITE_GUIDE_WIFI_NAME || 'Shared in your arrival message'
const wifiPassword = import.meta.env.VITE_GUIDE_WIFI_PASSWORD || 'Shared in your arrival message'

const CopyField = ({ label, value }) => {
  const [copied, setCopied] = useState(false)

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className='guide-copy-field'>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <button type='button' onClick={copyValue} aria-label={`Copy ${label}`}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

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
  <div className='guide-page'>
    <Meta title='Guest Guide | The Druids Den' description='The private guest guide for The Druids Den: arrival, Wi-Fi, heat, fire, local notes, emergencies, and checkout.' />
    <SiteHeader guide />
    <main>
      <section className='guide-hero' aria-labelledby='guide-title'>
        <div>
          <span className='guide-hero-eyebrow'>You are here</span>
          <CoelbrenLabel>Guest guide</CoelbrenLabel>
          <h1 id='guide-title'>Welcome to the Den.</h1>
          <p>Everything useful for your stay, in one place. The quiet can remain mysterious. The thermostat should not.</p>
        </div>
        <div className='guide-arrival-chip'>
          <span>Stay mode</span>
          <strong>Calm / clear / nearby</strong>
        </div>
      </section>

      <nav className='guide-quick-nav' aria-label='Guest guide shortcuts'>
        <span>Need now</span>
        <GuideLink href='#wifi'>Wi-Fi</GuideLink>
        <GuideLink href='#arrival'>Arrival</GuideLink>
        <GuideLink href='#comfort'>Heat & fire</GuideLink>
        <GuideLink href='#checkout'>Checkout</GuideLink>
      </nav>

      <section className='guide-critical' aria-labelledby='critical-title'>
        <div className='guide-critical-heading'>
          <span className='guide-hero-eyebrow'>The short path</span>
          <h2 id='critical-title'>Four things guests look for first.</h2>
        </div>
        <div className='guide-critical-links'>
          <GuideLink href='#wifi'>Find Wi-Fi</GuideLink>
          <GuideLink href='#arrival'>Get inside</GuideLink>
          <GuideLink href='#comfort'>Get comfortable</GuideLink>
          <GuideLink href='#checkout'>Leave well</GuideLink>
        </div>
      </section>

      <div className='guide-content'>
        <GuideSection id='wifi' index='01' title='Wi-Fi' icon='01-constellation.png' className='guide-section-wifi'>
          <p className='guide-lead'>The network and password belong here once your host has sent them. Both fields are ready to copy.</p>
          <div className='guide-copy-fields'>
            <CopyField label='Network' value={wifiNetwork} />
            <CopyField label='Password' value={wifiPassword} />
          </div>
          <p className='guide-muted'>Cell service can be spotty. Download anything you need before heading out.</p>
        </GuideSection>

        <GuideSection id='arrival' index='02' title='Arrival' icon='crow.png'>
          <div className='guide-two-column'>
            <div>
              <h3>Address & directions</h3>
              <CopyField label='Address' value={privateAddress} />
              <p className='guide-muted'>The Den is on a private road. Your invitation includes the exact address and the best final turn.</p>
            </div>
            <div>
              <h3>Parking</h3>
              <p>Park on the driveway. There is space for up to four vehicles in spring, summer, and fall. Winter parking is tighter after snow.</p>
              <h3>Entry & first steps</h3>
              <p>Entry details are shared privately before arrival. Once inside, take off wet boots, find the lights, and give the thermostat a moment to catch up.</p>
            </div>
          </div>
          <div className='guide-note guide-note-amber'>
            <strong>Exterior lighting</strong>
            <span>Use the entry and driveway lights after dark. Turn them off when you are settled in.</span>
          </div>
        </GuideSection>

        <GuideSection id='comfort' index='03' title='Heat & comfort' icon='great-horned-owl.png'>
          <p className='guide-lead'>The cabin is designed to warm up quietly. Start with the thermostat; use the fireplace for atmosphere and an extra layer of warmth.</p>
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
              <p>Use the fireplace for warmth and ambiance as instructed at the unit. Do not leave it running when you leave the cabin or go to sleep.</p>
            </details>
          </div>
        </GuideSection>

        <GuideSection id='kitchen' index='04' title='Kitchen' icon='acorn.png'>
          <div className='guide-two-column'>
            <div>
              <h3>Make yourself at home</h3>
              <p>The kitchen has what you need to prepare normal meals. Coffee supplies and everyday cookware are provided; check the cabinets before making a grocery run.</p>
            </div>
            <div>
              <h3>One good habit</h3>
              <p>Run the dishwasher when it is full, wipe up spills, and keep food sealed. The nearest grocery options are in Eagle River, about 15 minutes south.</p>
            </div>
          </div>
        </GuideSection>

        <GuideSection id='water' index='05' title='Water & septic' icon='duck.png'>
          <p className='guide-lead'>You do not need to understand the cabin's mechanical systems. Just keep the system light on its feet.</p>
          <ul className='guide-check-list'>
            <li>Only flush toilet paper and normal waste.</li>
            <li>Keep wipes, paper towels, grease, and other products out of the drains.</li>
            <li>Tell your host if a drain, toilet, or water fixture behaves unexpectedly.</li>
          </ul>
        </GuideSection>

        <GuideSection id='fire' index='06' title='Fire' icon='single-mushroom.png'>
          <div className='guide-two-column'>
            <div>
              <h3>Fireplace</h3>
              <p>Follow the fireplace instructions in the cabin. Keep anything flammable away from the unit and turn it off before bed or departure.</p>
            </div>
            <div>
              <h3>Fire pit</h3>
              <p>Use the outdoor fire pit only when conditions permit. Keep the fire attended, use the provided wood, and fully extinguish it with water before leaving it.</p>
            </div>
          </div>
          <div className='guide-note guide-note-urgent'>
            <strong>Safety first</strong>
            <span>The fire extinguisher locations are marked in the cabin. Call 911 for an emergency.</span>
          </div>
        </GuideSection>

        <GuideSection id='around' index='07' title='Around the cabin' icon='doe.png'>
          <div className='guide-two-column'>
            <div>
              <h3>Wildlife</h3>
              <p>Deer and turkeys are frequent neighbors. Store food properly, do not leave scraps outdoors, and give wildlife room.</p>
            </div>
            <div>
              <h3>Outside things</h3>
              <p>The covered porch, back patio, grill, fire pit, and back lot are yours to enjoy. Wear sturdy footwear and check for ticks after time in the woods.</p>
            </div>
          </div>
        </GuideSection>

        <GuideSection id='explore' index='08' title='Explore' icon='buck.png'>
          <p className='guide-lead'>A few reliable directions, condensed from the Northwoods field guide.</p>
          <div className='guide-explore-links'>
            <ArrowLink href='https://northwoodswisconsin.com/northern-wisconsin-recreation/eagle-river-chain-of-lakes/'>Eagle River Chain of 28 Lakes</ArrowLink>
            <ArrowLink href='https://derbycomplex.com/'>World Championship Derby Complex</ArrowLink>
            <ArrowLink href='https://buckshotseagleriver.com/'>Buckshot's Saloon & Eatery</ArrowLink>
            <ArrowLink to='/northwoods'>Open the full field guide</ArrowLink>
          </div>
        </GuideSection>

        <GuideSection id='emergency' index='09' title='Emergency' icon='raven.png' className='guide-section-emergency'>
          <div className='guide-emergency-grid'>
            <div>
              <span>Emergency services</span>
              <strong>911</strong>
              <p>Give the dispatcher the cabin address from your private arrival details.</p>
            </div>
            <div>
              <span>Host contact</span>
              <a href='mailto:grovekeeper@druidsdenwi.com'>grovekeeper@druidsdenwi.com</a>
              <p>For anything that is urgent but not an emergency, contact your host directly using the number in your invitation.</p>
            </div>
            <div>
              <span>Fire extinguishers</span>
              <strong>Marked in the cabin</strong>
              <p>Locate them when you arrive so you do not need to look in a hurry.</p>
            </div>
          </div>
        </GuideSection>

        <GuideSection id='checkout' index='10' title='Checkout' icon='pinecone.png' className='guide-section-checkout'>
          <p className='guide-lead'>A short walk-through, not a cleaning shift.</p>
          <ol className='guide-checkout-list'>
            <li><span>01</span>Turn off the fireplace and any fans or lights you used.</li>
            <li><span>02</span>Take food and personal items with you; leave the cabin ready for the next arrival.</li>
            <li><span>03</span>Close and lock the doors, then send your host a quick departure note.</li>
          </ol>
          <div className='guide-checkout-end'>
            <CoelbrenLabel>Until next time</CoelbrenLabel>
            <p>Thank you for taking care of the place. The woods will remember.</p>
            <Link to='/' className='text-link'>Return to the public site -&gt;</Link>
          </div>
        </GuideSection>
      </div>
    </main>
    <SiteFooter />
  </div>
)
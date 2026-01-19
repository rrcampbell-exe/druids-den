import { Link } from 'react-router'
import { Coelbren, Flower, Leaf, Awen, PageNav } from '../components'

const WhatToExpect = () => {
  const navItems = [
    { label: 'The Cabin', href: '#the-cabin' },
    { label: 'Year-Round Essentials', href: '#year-round-essentials' },
    { label: 'Spring', href: '#spring' },
    { label: 'Summer', href: '#summer' },
    { label: 'Fall', href: '#fall' },
    { label: 'Winter', href: '#winter' },
    { label: 'The Area', href: '#the-area' }
  ]

  return (
    <div className='what-to-expect-page'>
      <div className='page-header'>
        <div>
          <h1>What To Expect</h1>
          <Coelbren
            renderAs='h2'
            className='coelbren-subheading' 
          >
            (What To Expect)
          </Coelbren>
          <h2 className='subheading'>Your Guide to The Druids Den</h2>
          <div className='bottom-border' />
        </div>
        <Link to='/'>
          <div className='back-navigation'><Awen /> Go Back</div> 
        </Link>
      </div>
      <center>
        <Flower />
        <p>Nestled on 5.5 acres of private forest in Conover, Wisconsin, The Druids Den is a cozy 1BR + Loft cabin that serves as your basecamp for exploring the beautiful Northwoods. Whether you're seeking a peaceful retreat among the trees or an adventure-filled getaway, the cabin offers comfort and connection to nature year-round.</p>
        <Leaf />
      </center>
      
      <div className='what-to-expect-content-wrapper'>
        <PageNav items={navItems} />
        
        <main>
        <section className='cabin-overview' id='the-cabin'>
          <h2>The Cabin</h2>
          <div className='image-placeholder cabin-exterior'>
            {/* Placeholder for cabin exterior photo */}
          </div>
          <p>The Druids Den comfortably sleeps up to six guests (two in the primary bedroom, two in the loft, and up to two more on an air mattress in the living room). The cabin features:</p>
          <ul>
            <li><strong>Full Kitchen:</strong> Everything you need to prepare meals during your stay</li>
            <li><strong>Radiant In-Floor Heating:</strong> Stay cozy even on the coldest winter nights</li>
            <li><strong>Indoor Gas Fireplace:</strong> Perfect for ambiance and extra warmth</li>
            <li><strong>Washer & Dryer:</strong> Stackable unit for your convenience</li>
            <li><strong>Wi-Fi:</strong> Stay connected (though cell reception can be spotty)</li>
            <li><strong>Entertainment:</strong> Projector with DVD player for movie nights on the wall</li>
            <li><strong>Outdoor Spaces:</strong> Back patio, covered porch, fire pit, and gas grill</li>
          </ul>

          <h3>House Guidelines</h3>
          <p>To keep the cabin welcoming for all:</p>
          <ul>
            <li>No pets</li>
            <li>No smoking or vaping indoors</li>
            <li>Please remove shoes/boots when inside</li>
          </ul>

          <h3>Parking</h3>
          <p>Space available for up to four vehicles.</p>
        </section>

        <section className='year-round-essentials' id='year-round-essentials'>
          <h2>Year-Round Essentials</h2>
          <p>No matter the season, here's what to bring and keep in mind:</p>
          
          <h3>What's Provided</h3>
          <ul>
            <li>Bath towels and bed linens</li>
            <li>Firewood for the outdoor fire pit</li>
            <li>Kitchen essentials and cookware</li>
          </ul>

          <h3>What to Pack</h3>
          <ul>
            <li><strong>Outdoor Boots:</strong> Hiking boots or sturdy outdoor footwear for trails, mud, or snow</li>
            <li><strong>Layers:</strong> Weather can change quickly in the Northwoods</li>
            <li><strong>Flashlight or Headlamp:</strong> Helpful for nighttime fire pit gatherings and stargazing</li>
            <li><strong>Insect Repellent:</strong> Mosquitoes and ticks are common—perform tick checks after outdoor activities</li>
            <li><strong>Sunscreen & Sunglasses:</strong> Year-round sun protection</li>
            <li><strong>Reusable Water Bottles:</strong> Stay hydrated on hikes and adventures</li>
            <li><strong>First Aid Kit:</strong> Basic supplies for minor scrapes and needs</li>
            <li><strong>Your Favorite Beverages:</strong> Stock up in Eagle River before arriving</li>
          </ul>

          <h3>Good to Know</h3>
          <ul>
            <li><strong>Grocery Stores:</strong> Pick 'n Save and Trig's in Eagle River (15 minutes south) have everything you need. Energy Mart (5 minutes north) offers gas, alcohol, and limited essentials.</li>
            <li><strong>Cell Reception:</strong> Available but can be spotty—embrace the disconnect!</li>
            <li><strong>Private Road:</strong> The cabin is on a private road that is maintained and plowed in winter</li>
            <li><strong>Wildlife:</strong> You're in the forest! Respect the wildlife and store food properly</li>
            <li><strong>Hunting Season:</strong> During fall deer and turkey hunts, wear blaze orange when outdoors. You may hear gunshots from the public range several miles away year-round.</li>
          </ul>
        </section>

        <section className='seasonal-guide spring' id='spring'>
          <h2>Spring (March - May)</h2>
          <div className='season-content'>
            <div className='image-placeholder spring-photo'>
              {/* Placeholder for spring photo */}
            </div>
            <div className='season-details'>
              <h3>What to Expect</h3>
              <p>Spring in the Northwoods brings the forest back to life. Snow melts reveal fresh trails, temperatures warm gradually, and wildlife becomes more active. Early spring can still be chilly with occasional snow, while late spring offers pleasant hiking weather.</p>
              
              <h3>What to Pack</h3>
              <ul>
                <li>Waterproof hiking boots (trails can be muddy)</li>
                <li>Rain jacket and waterproof layers</li>
                <li>Warm fleece or jacket for cooler evenings</li>
                <li>Light gloves and hat for early spring</li>
                <li>Binoculars for bird watching</li>
                <li>Camera for wildflowers and emerging wildlife</li>
              </ul>

              <h3>Activities & Attractions</h3>
              <ul>
                <li>Hiking newly accessible trails</li>
                <li>Bird watching as migratory species return</li>
                <li>Fishing (season typically opens in early May)</li>
                <li>Exploring nearby waterfalls in Michigan's Upper Peninsula (20 minutes north)</li>
                <li>Visit local maple syrup farms</li>
                <li>Spring cleaning at the fire pit with s'mores</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='seasonal-guide summer' id='summer'>
          <h2>Summer (June - August)</h2>
          <div className='season-content'>
            <div className='image-placeholder summer-photo'>
              {/* Placeholder for summer photo */}
            </div>
            <div className='season-details'>
              <h3>What to Expect</h3>
              <p>Summer is peak season in the Northwoods. Warm, sunny days perfect for water activities, with temps typically in the 70s-80s°F. Long daylight hours mean more time for adventures. Mosquitoes are most active—come prepared!</p>
              
              <h3>What to Pack</h3>
              <ul>
                <li>Swimsuit, towels, and water shoes</li>
                <li>Lightweight, breathable clothing</li>
                <li>Sun hat and UV-protective clothing</li>
                <li>Plenty of insect repellent and after-bite treatment</li>
                <li>Hiking sandals or water-friendly shoes</li>
                <li>Fishing gear (if you're into it)</li>
                <li>Kayaking/water sports gear or plan to rent</li>
              </ul>

              <h3>Activities & Attractions</h3>
              <ul>
                <li><strong>Water Sports:</strong> Boating, kayaking, paddleboarding, and swimming on the <a href='https://northwoodswisconsin.com/northern-wisconsin-recreation/eagle-river-chain-of-lakes/' target='_blank' rel='noopener noreferrer'>Eagle River Chain of 28(!) Lakes</a>, plus nearby Pioneer Lake, North Twin Lake, and South Twin Lake</li>
                <li><strong>Boat Rentals:</strong> <a href='https://www.boatsport.com/' target='_blank' rel='noopener noreferrer'>Boat Sport Marina</a> offers affordable rentals—pick up on the chain or have them deliver to nearby lakes for a fee</li>
                <li>ATV trails (former snowmobile trails)</li>
                <li>Hiking and mountain biking</li>
                <li>Minigolf and go-karts in nearby St. Germain</li>
                <li><a href='https://www.eagleriver.org/events' target='_blank' rel='noopener noreferrer'>Eagle River events</a>: Cranberry Fest, concerts, farmers markets</li>
                <li>Friday Night Fish Fry tradition at local restaurants</li>
                <li>Scenic drives and waterfall tours in Michigan's Upper Peninsula</li>
                <li>Evening fire pit gatherings under the stars</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='seasonal-guide fall' id='fall'>
          <h2>Fall (September - November)</h2>
          <div className='season-content'>
            <div className='image-placeholder fall-photo'>
              {/* Placeholder for fall photo */}
            </div>
            <div className='season-details'>
              <h3>What to Expect</h3>
              <p>Fall transforms the forest into a tapestry of reds, oranges, and golds. Cooler temperatures make for excellent hiking weather, and the reduced bug activity is a welcome relief. Peak foliage typically occurs late September through mid-October. Be aware of hunting season and wear blaze orange outdoors.</p>
              
              <h3>What to Pack</h3>
              <ul>
                <li>Layered clothing (mornings and evenings get cold)</li>
                <li>Warm jacket and fleece</li>
                <li>Blaze orange vest or hat (hunting season safety)</li>
                <li>Comfortable hiking boots</li>
                <li>Gloves and beanie for chilly mornings</li>
                <li>Camera for fall foliage photography</li>
                <li>Warm blankets for outdoor fire pit evenings</li>
              </ul>

              <h3>Activities & Attractions</h3>
              <ul>
                <li>Leaf peeping and foliage photography</li>
                <li>Hiking trails through colorful forests</li>
                <li>ATV riding on trail systems</li>
                <li><a href='https://eaglerivercranberryfest.com/' target='_blank' rel='noopener noreferrer'>Cranberry Fest</a> in Eagle River (early October)</li>
                <li>Oktoberfest celebrations at local restaurants and breweries</li>
                <li>Fire pit gatherings (perfect weather for s'mores)</li>
                <li>Apple picking and fall festivals in the region</li>
                <li>Fishing (fall is excellent for musky and walleye)</li>
                <li>Cozy indoor movie nights with the projector</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='seasonal-guide winter' id='winter'>
          <h2>Winter (December - February)</h2>
          <div className='season-content'>
            <div className='image-placeholder winter-photo'>
              {/* Placeholder for winter photo */}
            </div>
            <div className='season-details'>
              <h3>What to Expect</h3>
              <p>Winter in the Northwoods is a true winter wonderland. Heavy snowfall from Lake Superior lake-effect creates perfect conditions for winter sports. Temperatures regularly dip below freezing, and the private road, while plowed, can be challenging. <strong>AWD or 4WD vehicles are strongly recommended.</strong> The cabin's radiant heating and fireplace keep you warm and cozy.</p>
              
              <h3>What to Pack</h3>
              <ul>
                <li><strong>Vehicle Essentials:</strong> Snow tires or AWD/4WD, ice scraper, emergency kit</li>
                <li>Heavy winter coat, insulated pants</li>
                <li>Waterproof, insulated boots with good traction</li>
                <li>Multiple layers: thermal underwear, fleeces, sweaters</li>
                <li>Winter accessories: warm hat, gloves/mittens, scarf, neck gaiter</li>
                <li>Hand and foot warmers</li>
                <li>Snowshoes (if you have them) or plan to rent</li>
                <li>Ski/snowboard gear or plan to rent locally</li>
                <li>Warm sleeping layers and extra blankets</li>
                <li>Hot cocoa, coffee, and comfort food supplies</li>
              </ul>

              <h3>Activities & Attractions</h3>
              <ul>
                <li><strong>Snowmobiling:</strong> Access extensive trail systems right from the area—rentals available locally</li>
                <li>Cross-country skiing and snowshoeing</li>
                <li>Ice fishing on frozen lakes</li>
                <li><a href='https://derbycomplex.com/' target='_blank' rel='noopener noreferrer'>World Championship Derby Complex</a> events in Eagle River</li>
                <li>Scenic winter drives and photography</li>
                <li>Visit UP Michigan waterfalls in winter (frozen waterfalls are spectacular)</li>
                <li>Cozy indoor activities: board games, movie marathons, reading by the fire</li>
                <li>Snow tubing and sledding on the property</li>
                <li>Stargazing (winter skies are exceptionally clear)</li>
                <li>Friday Night Fish Fry at local establishments</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='local-area' id='the-area'>
          <h2>The Area</h2>
          <h3>Conover, Eagle River, and the Northwoods</h3>
          <p>The Druids Den sits in Conover, Wisconsin, with Eagle River serving as the local hub just 15 minutes south. Eagle River offers shopping, dining, seasonal events, and serves as "The Snowmobile Capital of the World," but don't let that fool you: there's plenty to do year-round in Vilas County and beyond!</p>

          <h3>Dining Recommendations</h3>
          <ul>
            <li><a href='https://buckshotseagleriver.com/' target='_blank' rel='noopener noreferrer'>Buckshot's Saloon & Eatery</a> (Conover/Eagle River border) - Great food and atmosphere</li>
            <li><a href='https://www.thecraftsmanamericantavern.com/' target='_blank' rel='noopener noreferrer'>The Craftsman American Tavern</a> (Eagle River) - Upscale dining</li>
            <li><a href='https://www.facebook.com/brewspublando/' target='_blank' rel='noopener noreferrer'>Brew's Pub</a> (Land O' Lakes) - Worth the drive north</li>
            <li>Local Friday Night Fish Fry tradition at any number of northwoods supper clubs</li>
          </ul>

          <h3>Notable Attractions</h3>
          <ul>
            <li><a href='https://northwoodswisconsin.com/northern-wisconsin-recreation/eagle-river-chain-of-lakes/' target='_blank' rel='noopener noreferrer'>Eagle River Chain of Lakes</a> - 28 interconnected lakes perfect for boating</li>
            <li><a href='https://derbycomplex.com/' target='_blank' rel='noopener noreferrer'>World Championship Derby Complex</a> - Snowmobile racing venue</li>
            <li>Michigan's Upper Peninsula - Just 20 minutes north for waterfalls and trails</li>
            <li>Numerous hiking trails and nature areas</li>
            <li>Mini-golf, go-karts, and family activities in <a href='https://elmersfunpark.com/' target='_blank' rel='noopener noreferrer'>St. Germain</a></li>
            <li>Seasonal events: <a href='https://eagleriver.org/events/cranberry-fest/' target='_blank' rel='noopener noreferrer'>Cranberry Fest</a>, <a href='https://www.eagleriverrevitalization.org/farmers-market/' target='_blank' rel='noopener noreferrer'>Farmers Market</a>, <a href='https://witravelbestbets.com/event/three-lakes-oktoberfest/' target='_blank' rel='noopener noreferrer'>Oktoberfest in Three Lakes</a>, concerts, markets</li>
          </ul>

          <div className='image-placeholder area-map'>
            {/* Placeholder for area map or local attractions photo */}
          </div>
        </section>

        <section className='final-notes'>
          <h2>Questions?</h2>
          <p>If you have any questions about your stay at The Druids Den, what to bring, or what to explore in the area, don't hesitate to reach out. We want to ensure you have everything you need for a memorable stay in the Northwoods.</p>
          <p>Welcome to the woods. Welcome to The Druids Den.</p>
        </section>
      </main>
      </div>
    </div>
  )
}

export default WhatToExpect

import { Link } from 'react-router'
import './WhatToExpect.scss'
import { Coelbren, Flower, Leaf, Awen, PageNav, CaptionedImage } from '../components'

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
        <p>Nestled on 5½ secluded acres of private forest in Conover, Wisconsin, The Druids Den is your cozy woodland basecamp for exploring the beautiful Northwoods of Wisconsin and Michigan's Upper Peninsula. Whether you're seeking a peaceful retreat among the trees or an adventure-filled getaway, The Druids Den offers comfort and connection to nature year-round.</p>
        <Leaf />
      </center>
      
      <div className='what-to-expect-content-wrapper'>
        <PageNav items={navItems} />
        
        <main>
        <section className='cabin-overview' id='the-cabin'>
          <h2>The Cabin</h2>
          <CaptionedImage 
            src='/assets/images/druids_den_welcome_sign.jpg' 
            alt="The Druids Den's welcome sign at the driveway entrance" 
            className='cabin-exterior'
            style={{ objectPosition: 'center 45%' }}
          />
          <p>The Druids Den comfortably sleeps up to six guests (two in the primary bedroom, two in the loft, and up to two more on an air mattress in the living room). The cabin features:</p>
          <ul>
            <li>Full Kitchen: Everything you need to prepare meals during your stay</li>
            <li>Radiant In-Floor Heating: Stay cozy even on the coldest winter nights</li>
            <li>Indoor Gas Fireplace: Perfect for ambiance and extra warmth</li>
            <li>Washer & Dryer: Stackable unit for your convenience</li>
            <li>Wi-Fi: Stay connected (though cell reception can be spotty)</li>
            <li>Entertainment: Projector with DVD player for movie nights on the wall</li>
            <li>Outdoor Spaces: Back patio, covered porch, fire pit, gas grill, and a sizeable back lot for exploring</li>
            <li>Wildlife: Deer and turkeys will be your closest neighbors, and if you're lucky, you might be visited by the bonded pair of Barred Owls who live nearby!</li>
          </ul>

          <h3>House Guidelines</h3>
          <p>To keep the cabin welcoming for all, we ask that you respect the following:</p>
          <ul>
            <li>No pets unless cleared with Ryan and Lacey in advance</li>
            <li>No smoking or vaping indoors—no exceptions</li>
            <li>Please remove shoes/boots when inside</li>
          </ul>

          <h3>Parking</h3>
          <p>There is space available for up to four vehicles during spring, summer, and fall. Winter parking is more limited due to snow accumulations, though two vehicles should still fit comfortably.</p>
        </section>

        <section className='year-round-essentials' id='year-round-essentials'>
          <h2>Year-Round Essentials</h2>
          <p>No matter the season, here's what to bring and keep in mind:</p>
          
          <h3>What's Provided</h3>
          <ul>
            <li>Bath towels and bed linens</li>
            <li>Firewood for the outdoor fire pit</li>
            <li>Kitchen essentials and cookware</li>
            <li>A variety of DVDs for use with the projector</li>
            <li>A gas grill for outdoor cooking</li>
          </ul>

          <h3>What to Pack</h3>
          <ul>
            <li>Outdoor Boots: Hiking boots or sturdy outdoor footwear for trails, mud, or snow</li>
            <li>Layers: Weather can change quickly in the Northwoods</li>
            <li>Insect Repellent: Mosquitoes and ticks are common—perform tick checks after outdoor activities</li>
            <li>Sunscreen & Sunglasses: Year-round sun protection</li>
            <li>Reusable Water Bottles: Stay hydrated on hikes and adventures</li>
            <li>First Aid Kit: Basic supplies for minor scrapes and needs</li>
            <li>Your Favorite Beverages: Stock up in Eagle River before arriving</li>
          </ul>

          <h3>Good to Know</h3>
          <ul>
            <li>Grocery Stores: Pick 'n Save and Trig's in Eagle River (15 minutes south) have everything you need. Energy Mart (5 minutes north) offers gas, alcohol, an assortment of meats for grilling, and limited essentials.</li>
            <li>Cell Reception: Available but can be spotty—embrace the disconnect!</li>
            <li>Private Road: The cabin is on a private road that is maintained and plowed in winter</li>
            <li>Wildlife: You're in the forest! Respect the wildlife and store food properly. Though we've not seen bears nearby, assume they are: don't leave scraps outdoors for them or other curious critters.</li>
            <li>Hunting Season: During fall deer and turkey hunts, wear blaze orange when outdoors. Outside of hunting season, you may still hear gunshots from the public range several miles away.</li>
          </ul>
        </section>

        <section className='seasonal-guide spring' id='spring'>
          <h2>Spring</h2>
          <div className='season-content'>
            <CaptionedImage 
              src='/assets/images/druids_den_mushroom_on_tree.jpg' 
              alt='A mushroom grows from a tree trunk at The Druids Den' 
              className='spring-photo'
              style={{ objectPosition: 'center 55%' }}
            />
            <div className='season-details'>
              <h3>What to Expect</h3>
              <p>Spring in the Northwoods brings the forest back to life. The snow melts reveal fresh trails, temperatures warm gradually, and wildlife becomes more active. Early spring can still be chilly with occasional snow, while late spring offers more pleasant hiking weather.</p>
              
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
                <li>Springtime s'mores at the fire pit</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='seasonal-guide summer' id='summer'>
          <h2>Summer</h2>
          <div className='season-content'>
            <CaptionedImage 
              src='/assets/images/druids_den_summer_sun_in_foliage.jpg' 
              alt='Summer foliage on a trail behind The Druids Den' 
              className='summer-photo'
              style={{ objectPosition: 'center 58%' }}
            />
            <div className='season-details'>
              <h3>What to Expect</h3>
              <p>The warm, sunny days of summer are perfect for water activities, and long daylight hours mean more time for adventures. Mosquitoes are most active in the summer—come prepared!</p>
              
              <h3>What to Pack</h3>
              <ul>
                <li>Swimsuit, towels, and water shoes</li>
                <li>Lightweight, breathable clothing</li>
                <li>Sun hat and UV-protective clothing</li>
                <li>Plenty of insect repellent and after-bite treatment</li>
                <li>Hiking shoes, sandals, or water-friendly shoes</li>
                <li>Fishing gear (if you're into it)</li>
                <li>Kayaking/water sports gear or a plan to rent them, if necessary</li>
              </ul>

              <h3>Activities & Attractions</h3>
              <ul>
                <li>Water Sports: Boating, kayaking, paddleboarding, and swimming on the <a href='https://northwoodswisconsin.com/northern-wisconsin-recreation/eagle-river-chain-of-lakes/' target='_blank' rel='noopener noreferrer'>Eagle River Chain of 28(!) Lakes</a>, plus nearby Pioneer Lake, North Twin Lake, and South Twin Lake</li>
                <li>Boat Rentals: <a href='https://www.boatsport.com/' target='_blank' rel='noopener noreferrer'>Boat Sport Marina</a> offers affordable rentals—pick up on the chain or have them deliver to nearby lakes for a fee</li>
                <li>ATV trails (former snowmobile trails)</li>
                <li>Hiking and mountain biking</li>
                <li>Minigolf and go-karts in nearby <a href='https://elmersfunpark.com/' target='_blank' rel='noopener noreferrer'>St. Germain</a></li>
                <li><a href='https://www.eagleriver.org/events' target='_blank' rel='noopener noreferrer'>Eagle River events</a>, including summer concerts and farmers markets</li>
                <li>Friday Night Fish Fry tradition at local restaurants</li>
                <li>Scenic drives and waterfall tours in Michigan's Upper Peninsula</li>
                <li>Evening fire pit gatherings under the stars</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='seasonal-guide fall' id='fall'>
          <h2>Fall</h2>
          <div className='season-content'>
            <CaptionedImage 
              src='/assets/images/druids_den_fall_foliage.jpg' 
              alt='Fall foliage above the fire pit at The Druids Den' 
              className='fall-photo'
              style={{ objectPosition: 'center 15%' }}
            />
            <div className='season-details'>
              <h3>What to Expect</h3>
              <p>Fall transforms the forest into a tapestry of reds, oranges, and golds. Cooler temperatures make for excellent hiking weather, and the reduced bug activity is a welcome relief. Peak foliage typically occurs late September through early October. Be aware of hunting season and wear blaze orange outdoors.</p>
              
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
          <h2>Winter</h2>
          <div className='season-content'>
            <CaptionedImage 
              src='/assets/images/druids_den_winter_driveway.jpg' 
              alt='The Druids Den covered in snow during winter' 
              className='winter-photo'
              style={{ objectPosition: 'center 60%' }}
            />
            <div className='season-details'>
              <h3>What to Expect</h3>
              <p>Winter in the Northwoods is a true winter wonderland. Heavy lake-effect snowfall from Lake Superior creates perfect conditions for winter sports. Temperatures regularly dip below freezing, and the private road, while plowed, can be challenging. The cabin's radiant heating and fireplace keep you warm and cozy.</p>
              <p>❄️ AWD or 4WD vehicles are strongly recommended at this time of year. ❄️</p>
              
              <h3>What to Pack</h3>
              <ul>
                <li>Vehicle Essentials: Snow tires or AWD/4WD, ice scraper, emergency kit</li>
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
                <li>Snowmobiling: Access extensive trail systems right from the area—rentals available locally</li>
                <li>Cross-country skiing and snowshoeing</li>
                <li>Ice fishing on frozen lakes</li>
                <li><a href='https://derbycomplex.com/' target='_blank' rel='noopener noreferrer'>World Championship Derby Complex</a> events in Eagle River</li>
                <li>Scenic winter drives and photography</li>
                <li>Visit Upper Peninsula Michigan waterfalls in winter (frozen waterfalls are spectacular)</li>
                <li>Cozy indoor activities: board games, movie marathons, reading by the fire</li>
                <li>Stargazing (winter skies are exceptionally clear)</li>
                <li>Friday Night Fish Fry at local establishments</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='local-area' id='the-area'>
          <h2>The Area</h2>
          <h3>Conover, Eagle River, and the Northwoods</h3>
          <p>The Druids Den is in Conover, Wisconsin, with Eagle River serving as the local hub just 15 minutes south. Eagle River offers shopping, dining, seasonal events, and serves as "The Snowmobile Capital of the World," but don't let that fool you: there's plenty to do year-round in Vilas County and beyond!</p>

          <h3>Dining Recommendations</h3>
          <ul>
            <li><a href='https://buckshotseagleriver.com/' target='_blank' rel='noopener noreferrer'>Buckshot's Saloon & Eatery</a> (Conover/Eagle River border) - Great food and atmosphere</li>
            <li><a href='https://www.thecraftsmanamericantavern.com/' target='_blank' rel='noopener noreferrer'>The Craftsman American Tavern</a> (Eagle River) - Upscale dining</li>
            <li><a href='https://www.facebook.com/brewspublando/' target='_blank' rel='noopener noreferrer'>Brew's Pub</a> (Land O' Lakes) - Worth the drive north</li>
            <li>Local Friday Night Fish Fry tradition at any number of Northwoods supper clubs</li>
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

          <div className='what-to-expect-image area-map'>
            {/* Placeholder for area map or local attractions photo */}
          </div>
        </section>

        <section className='final-notes'>
          <h2>Questions?</h2>
          <p>If you have any questions about your stay at The Druids Den, what to bring, or what to explore in the area, don't hesitate to contact either Ryan or Lacey. We want to ensure you have everything you need for a memorable stay in the Northwoods.</p>
          <p>Welcome to the woods. Welcome to The Druids Den.</p>
        </section>
      </main>
      </div>
    </div>
  )
}

export default WhatToExpect

import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BLOG_CONTENT = {
  "petra-guide": {
    title: "A Practical Petra Guide: Routes, Timing, and Tickets",
    titleAr: "دليل عملي للبتراء: المسارات والتوقيت والتذاكر",
    meta: "Everything you need to know for your perfect Petra visit",
    metaAr: "كل ما تحتاجه لزيارة البتراء المثالية",
    content: `
      <div class='prose prose-lg max-w-none text-slate-800 dark:text-slate-200'>
        <p class='lead text-xl font-medium text-slate-700 dark:text-slate-300 mb-8 leading-relaxed'>Petra, the ancient Nabatean city carved into rose-red cliffs, is one of the world's most spectacular archaeological sites. This comprehensive guide will help you make the most of your visit to this UNESCO World Heritage Site.</p>

        <div class='bg-gradient-to-r from-jordan-rose/10 to-jordan-gold/10 p-6 rounded-xl mb-8 border-l-4 border-jordan-rose'>
          <h2 class='text-2xl font-bold text-jordan-rose mb-4 flex items-center gap-2'>
            <span class='w-2 h-2 bg-jordan-rose rounded-full'></span>
            Best Time to Visit Petra
          </h2>
          <p class='text-slate-700 dark:text-slate-300 leading-relaxed'>The ideal time to visit Petra is during the cooler months from October to April. Summer temperatures can exceed 40°C (104°F), making the extensive walking quite challenging. Early morning visits (before 9 AM) or late afternoon are best to avoid the midday heat and crowds.</p>
        </div>

        <div class='bg-gradient-to-r from-jordan-blue/10 to-jordan-teal/10 p-6 rounded-xl mb-8 border-l-4 border-jordan-blue'>
          <h2 class='text-2xl font-bold text-jordan-blue mb-4 flex items-center gap-2'>
            <span class='w-2 h-2 bg-jordan-blue rounded-full'></span>
            Ticket Options and Pricing
          </h2>
          <div class='grid md:grid-cols-1 gap-4'>
            <div class='bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700'>
              <div class='flex items-center justify-between mb-2'>
                <span class='font-semibold text-jordan-blue'>One Day Ticket</span>
                <span class='text-lg font-bold text-jordan-gold'>50 JOD</span>
              </div>
              <p class='text-sm text-slate-600 dark:text-slate-400'>approximately $70 USD - includes access to most sites</p>
            </div>
            <div class='bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700'>
              <div class='flex items-center justify-between mb-2'>
                <span class='font-semibold text-jordan-blue'>Two Day Ticket</span>
                <span class='text-lg font-bold text-jordan-gold'>55 JOD</span>
              </div>
              <p class='text-sm text-slate-600 dark:text-slate-400'>allows re-entry over two consecutive days</p>
            </div>
            <div class='bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700'>
              <div class='flex items-center justify-between mb-2'>
                <span class='font-semibold text-jordan-blue'>Petra by Night</span>
                <span class='text-lg font-bold text-jordan-gold'>17 JOD</span>
              </div>
              <p class='text-sm text-slate-600 dark:text-slate-400'>magical evening experience with candlelit pathways</p>
            </div>
          </div>
        </div>

        <div class='bg-gradient-to-r from-jordan-teal/10 to-jordan-blue/10 p-6 rounded-xl mb-8 border-l-4 border-jordan-teal'>
          <h2 class='text-2xl font-bold text-jordan-teal mb-6 flex items-center gap-2'>
            <span class='w-2 h-2 bg-jordan-teal rounded-full'></span>
            Essential Routes to Explore
          </h2>

          <div class='space-y-6'>
            <div class='bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700'>
              <div class='flex items-start gap-4'>
                <div class='w-12 h-12 bg-jordan-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                  <span class='text-white font-bold text-lg'>1</span>
                </div>
                <div>
                  <h3 class='text-xl font-bold text-slate-900 dark:text-slate-100 mb-2'>The Main Siq Route (2-3 hours)</h3>
                  <p class='text-slate-700 dark:text-slate-300 leading-relaxed'>Start with the iconic walk through the Siq, a 1.2km narrow gorge that leads to the Treasury. This route takes about 2-3 hours round trip and covers the most famous sights.</p>
                </div>
              </div>
            </div>

            <div class='bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700'>
              <div class='flex items-start gap-4'>
                <div class='w-12 h-12 bg-jordan-rose rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                  <span class='text-white font-bold text-lg'>2</span>
                </div>
                <div>
                  <h3 class='text-xl font-bold text-slate-900 dark:text-slate-100 mb-2'>The Monastery Trail (2 hours)</h3>
                  <p class='text-slate-700 dark:text-slate-300 leading-relaxed'>For the adventurous, climb 800 steps to reach the Monastery, Petra's largest monument. The views from the top are breathtaking and worth every step.</p>
                </div>
              </div>
            </div>

            <div class='bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700'>
              <div class='flex items-start gap-4'>
                <div class='w-12 h-12 bg-jordan-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                  <span class='text-white font-bold text-lg'>3</span>
                </div>
                <div>
                  <h3 class='text-xl font-bold text-slate-900 dark:text-slate-100 mb-2'>High Places Routes</h3>
                  <p class='text-slate-700 dark:text-slate-300 leading-relaxed'>Explore the sacrificial altars and royal tombs on the hills surrounding Petra. These routes offer stunning panoramic views but require good fitness and sturdy shoes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class='bg-gradient-to-r from-jordan-gold/10 to-jordan-rose/10 p-6 rounded-xl mb-8 border-l-4 border-jordan-gold'>
          <h2 class='text-2xl font-bold text-jordan-gold mb-6 flex items-center gap-2'>
            <span class='w-2 h-2 bg-jordan-gold rounded-full'></span>
            Practical Tips
          </h2>
          <div class='grid md:grid-cols-2 gap-4'>
            <div class='flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700'>
              <div class='w-6 h-6 bg-jordan-blue rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span class='text-white text-xs'>✓</span>
              </div>
              <p class='text-sm text-slate-700 dark:text-slate-300'>Wear comfortable walking shoes - you'll cover 4-8km depending on your route</p>
            </div>
            <div class='flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700'>
              <div class='w-6 h-6 bg-jordan-blue rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span class='text-white text-xs'>✓</span>
              </div>
              <p class='text-sm text-slate-700 dark:text-slate-300'>Bring plenty of water, especially in summer</p>
            </div>
            <div class='flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700'>
              <div class='w-6 h-6 bg-jordan-blue rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span class='text-white text-xs'>✓</span>
              </div>
              <p class='text-sm text-slate-700 dark:text-slate-300'>Hire a guide for deeper insights into Nabatean history</p>
            </div>
            <div class='flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700'>
              <div class='w-6 h-6 bg-jordan-blue rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span class='text-white text-xs'>✓</span>
              </div>
              <p class='text-sm text-slate-700 dark:text-slate-300'>Consider a horse or donkey for the initial approach to the Siq</p>
            </div>
            <div class='flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700'>
              <div class='w-6 h-6 bg-jordan-blue rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span class='text-white text-xs'>✓</span>
              </div>
              <p class='text-sm text-slate-700 dark:text-slate-300'>Visit early morning to avoid crowds and heat</p>
            </div>
          </div>
        </div>

        <div class='bg-gradient-to-r from-jordan-teal/10 to-jordan-blue/10 p-6 rounded-xl mb-8 border-l-4 border-jordan-teal'>
          <h2 class='text-2xl font-bold text-jordan-teal mb-4 flex items-center gap-2'>
            <span class='w-2 h-2 bg-jordan-teal rounded-full'></span>
            Where to Stay Near Petra
          </h2>
          <p class='text-slate-700 dark:text-slate-300 leading-relaxed mb-4'>Petra is located in a valley, so most accommodation is in the nearby town of Wadi Musa. Options range from budget guesthouses to luxury resorts. For the ultimate experience, consider staying in a cave hotel carved into the surrounding hills.</p>
        </div>

        <div class='bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-6 rounded-xl border-l-4 border-amber-400 mb-8'>
          <div class='flex items-start gap-3'>
            <div class='w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
              <span class='text-white font-bold'>💡</span>
            </div>
            <div>
              <h3 class='text-lg font-bold text-amber-800 dark:text-amber-200 mb-2'>Pro Tip</h3>
              <p class='text-amber-700 dark:text-amber-300 leading-relaxed'>Book your Petra tickets online in advance to skip the lines at the entrance. The site can get crowded, especially during peak tourist season.</p>
            </div>
          </div>
        </div>
      </div>
    `,
  },
  "wadi-rum-camps": {
    title: "Choosing the Perfect Wadi Rum Camp: Comfort vs. Authenticity",
    titleAr: "اختيار المخيم المثالي في وادي رم: الراحة مقابل الأصالة",
    meta: "Finding your ideal desert camping experience",
    metaAr: "العثور على تجربة التخييم الصحراوية المثالية",
    content: `
      <div class='prose prose-lg max-w-none'>
        <p class='lead'>Wadi Rum, Jordan's majestic desert landscape, offers camping experiences that range from ultra-luxurious glamping to authentic Bedouin-style tents. Choosing the right camp depends on your comfort preferences, budget, and desired level of adventure.</p>

        <h2>Types of Wadi Rum Camps</h2>

        <h3>Luxury Glamping Camps</h3>
        <p>These camps offer the ultimate comfort with air-conditioned tents, private bathrooms, and gourmet dining. Perfect for those who want desert romance without sacrificing modern amenities.</p>
        <ul>
          <li><strong>Private bathrooms</strong> with hot showers</li>
          <li><strong>Air-conditioned tents</strong> with comfortable beds</li>
          <li><strong>Gourmet meals</strong> prepared by professional chefs</li>
          <li><strong>Price range:</strong> $200-500 per night</li>
        </ul>

        <h3>Mid-Range Camps</h3>
        <p>A good balance between comfort and authenticity. These camps typically offer shared facilities but maintain the desert atmosphere.</p>
        <ul>
          <li><strong>Shared bathroom facilities</strong></li>
          <li><strong>Comfortable bedding</strong> in traditional tents</li>
          <li><strong>Traditional meals</strong> with some modern touches</li>
          <li><strong>Price range:</strong> $80-150 per night</li>
        </ul>

        <h3>Authentic Bedouin Camps</h3>
        <p>For the true desert experience, stay in traditional goat-hair tents used by Bedouin nomads for centuries.</p>
        <ul>
          <li><strong>Traditional goat-hair tents</strong></li>
          <li><strong>Shared outdoor facilities</strong></li>
          <li><strong>Authentic Bedouin hospitality</strong></li>
          <li><strong>Price range:</strong> $30-70 per night</li>
        </ul>

        <h2>What to Consider When Choosing</h2>

        <h3>Your Comfort Level</h3>
        <p>If you prefer hot showers and comfortable beds, opt for glamping. If you're seeking an authentic cultural experience, traditional camps are ideal.</p>

        <h3>Group Size</h3>
        <p>Larger groups might appreciate private facilities, while solo travelers or couples often prefer the intimacy of traditional camps.</p>

        <h3>Activities and Location</h3>
        <p>Consider proximity to hiking trails, viewpoints, and other attractions. Some camps are located near popular rock formations or offer better stargazing spots.</p>

        <h2>Popular Camp Recommendations</h2>

        <div class='grid md:grid-cols-2 gap-6 my-6'>
          <div class='border rounded-lg p-4'>
            <h4 class='font-semibold text-lg'>Sun City Camp</h4>
            <p>Luxury glamping with stunning views of Jebel Rum. Perfect for honeymooners seeking romance.</p>
          </div>
          <div class='border rounded-lg p-4'>
            <h4 class='font-semibold text-lg'>Bedouin Lifestyle Camp</h4>
            <p>Authentic Bedouin experience with traditional meals and storytelling around the fire.</p>
          </div>
        </div>

        <h2>Booking Tips</h2>
        <ul>
          <li><strong>Book in advance</strong> during peak season (October-April)</li>
          <li><strong>Check cancellation policies</strong> - desert weather can be unpredictable</li>
          <li><strong>Inquire about included activities</strong> like jeep tours or stargazing</li>
          <li><strong>Confirm meal preferences</strong> - many camps accommodate dietary restrictions</li>
        </ul>

        <div class='bg-blue-50 p-4 rounded-lg my-6'>
          <h3 class='text-blue-800 font-semibold'>Cultural Note</h3>
          <p class='text-blue-700'>When staying in traditional camps, you're not just a tourist - you're a guest in someone's home. Respect local customs and enjoy the genuine hospitality of the Bedouin people.</p>
        </div>
      </div>
    `,
  },
  "amman-food": {
    title: "Amman's Ultimate Food Map: Where to Eat and What to Try",
    titleAr: "خريطة الطعام النهائية في عمّان: أين تأكل وماذا تجرب",
    meta: "A culinary journey through Jordan's capital",
    metaAr: "رحلة طعامية عبر عاصمة الأردن",
    content: `
      <div class='prose prose-lg max-w-none'>
        <p class='lead'>Amman, often called the "White City" for its limestone buildings, is a food lover's paradise. From traditional Jordanian dishes to international cuisine, the city's diverse food scene reflects its rich cultural heritage and modern influences.</p>

        <h2>Traditional Jordanian Cuisine</h2>

        <h3>Mansaf - The National Dish</h3>
        <p>No visit to Amman is complete without trying mansaf, Jordan's national dish. This aromatic rice dish cooked with lamb and yogurt sauce is traditionally eaten with your hands.</p>
        <p><strong>Where to try it:</strong> Al-Quds Restaurant in Shmeisani serves an authentic version that's been pleasing locals for decades.</p>

        <h3>Shawarma and Falafel</h3>
        <p>Street food at its finest. Fresh pita bread stuffed with spiced meat or chickpeas, topped with tahini sauce and pickled vegetables.</p>
        <p><strong>Best spots:</strong> Hashem Restaurant for shawarma, or any street vendor for falafel sandwiches.</p>

        <h2>Neighborhood Food Scenes</h2>

        <h3>Downtown Amman</h3>
        <p>The historic center offers authentic local experiences. Wander through the souks and discover hidden eateries serving traditional mezze and grilled meats.</p>

        <h3>Shmeisani District</h3>
        <p>Modern Amman's dining hub. From fine dining restaurants to casual cafes, Shmeisani has something for every taste and budget.</p>

        <h3>Jabal Amman</h3>
        <p>The upscale neighborhood features trendy restaurants with panoramic city views. Perfect for special occasions or romantic dinners.</p>

        <h2>International Cuisine</h2>

        <h3>Lebanese and Syrian</h3>
        <p>Given the cultural connections, Lebanese and Syrian food is exceptionally good in Amman. Try hummus, tabbouleh, and grilled meats at places like Reem Al-Bawadi.</p>

        <h3>Italian and Mediterranean</h3>
        <p>Several excellent Italian restaurants offer authentic pasta and pizza. For Mediterranean fusion, try the rooftop restaurants in Jabal Amman.</p>

        <h2>Street Food and Markets</h2>

        <h3>Al-Mufti Street</h3>
        <p>Amman's answer to a food street. Dozens of vendors offer everything from fresh juices to traditional sweets.</p>

        <h3>Wild Jordan Center</h3>
        <p>While primarily a shop, they have a cafe serving healthy, organic Jordanian-inspired dishes.</p>

        <h2>Desserts and Sweets</h2>
        <ul>
          <li><strong>Halva:</strong> Sweet confection made from sunflower seeds</li>
          <li><strong>Ma'amoul:</strong> Date-filled cookies, especially during Ramadan</li>
          <li><strong>Turkish Delight:</strong> Gelatin-based sweets in various flavors</li>
          <li><strong>Knafa:</strong> Shredded pastry with cheese or nuts, soaked in syrup</li>
        </ul>

        <h2>Vegetarian and Vegan Options</h2>
        <p>While meat features prominently in Jordanian cuisine, there are excellent vegetarian options:</p>
        <ul>
          <li><strong>Mujaddara:</strong> Lentils and rice with caramelized onions</li>
          <li><strong>Falafel and hummus</strong> are naturally vegan</li>
          <li><strong>Grilled vegetables</strong> and mezze platters</li>
        </ul>

        <h2>Food Etiquette and Tips</h2>
        <ul>
          <li><strong>Sharing is caring:</strong> Meals are often family-style</li>
          <li><strong>Try local spices:</strong> Sumac, za'atar, and olive oil are staples</li>
          <li><strong>Tea culture:</strong> Expect multiple rounds of tea with meals</li>
          <li><strong>Portion sizes:</strong> Order conservatively - Jordanian hospitality means generous servings</li>
        </ul>

        <div class='bg-green-50 p-4 rounded-lg my-6'>
          <h3 class='text-green-800 font-semibold'>Local Tip</h3>
          <p class='text-green-700'>When dining with locals, wait for the host to start eating before you begin. And remember, it's considered polite to leave a little food on your plate to show you were satisfied.</p>
        </div>

        <h2>Budget Considerations</h2>
        <p>Amman offers dining options for every budget:</p>
        <ul>
          <li><strong>Street food:</strong> 2-5 JOD per meal</li>
          <li><strong>Casual restaurants:</strong> 10-20 JOD per person</li>
          <li><strong>Fine dining:</strong> 30+ JOD per person</li>
        </ul>

        <p>Whether you're craving traditional Jordanian dishes or international cuisine, Amman's food scene will delight your palate and introduce you to the warmth of Jordanian hospitality.</p>
      </div>
    `,
  },
};

export default function BlogPost() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const post = useMemo(() => {
    return BLOG_CONTENT[slug] || {
      title: "Post Not Found",
      titleAr: "المنشور غير موجود",
      meta: "The requested article could not be found.",
      metaAr: "المحتوى المطلوب غير موجود.",
      content: "<p>Sorry, this article is not available.</p>",
    };
  }, [slug]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">
            {t('pages.blog.hero.kicker')}
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-display mb-6">
            {isArabic ? post.titleAr : post.title}
          </h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95">
            {isArabic ? post.metaAr : post.meta}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <div className="mb-8">
          <Link
            to="/blog"
            aria-label={t('pages.blog.backToBlog')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[44px] items-center justify-center"
          >
            ← {t('pages.blog.backToBlog')}
          </Link>
        </div>

        <article className="prose prose-lg dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-semibold"
            >
              {t('pages.blog.readMore')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

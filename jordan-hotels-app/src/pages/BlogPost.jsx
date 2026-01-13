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
      <div class='prose prose-lg max-w-none'>
        <p class='lead'>Petra, the ancient Nabatean city carved into rose-red cliffs, is one of the world's most spectacular archaeological sites. This comprehensive guide will help you make the most of your visit to this UNESCO World Heritage Site.</p>

        <h2>Best Time to Visit Petra</h2>
        <p>The ideal time to visit Petra is during the cooler months from October to April. Summer temperatures can exceed 40°C (104°F), making the extensive walking quite challenging. Early morning visits (before 9 AM) or late afternoon are best to avoid the midday heat and crowds.</p>

        <h2>Ticket Options and Pricing</h2>
        <ul>
          <li><strong>One Day Ticket:</strong> 50 JOD (approximately $70 USD) - includes access to most sites</li>
          <li><strong>Two Day Ticket:</strong> 55 JOD - allows re-entry over two consecutive days</li>
          <li><strong>Petra by Night:</strong> 17 JOD - magical evening experience with candlelit pathways</li>
        </ul>

        <h2>Essential Routes to Explore</h2>
        <h3>The Main Siq Route (2-3 hours)</h3>
        <p>Start with the iconic walk through the Siq, a 1.2km narrow gorge that leads to the Treasury. This route takes about 2-3 hours round trip and covers the most famous sights.</p>

        <h3>The Monastery Trail (2 hours)</h3>
        <p>For the adventurous, climb 800 steps to reach the Monastery, Petra's largest monument. The views from the top are breathtaking and worth every step.</p>

        <h3>High Places Routes</h3>
        <p>Explore the sacrificial altars and royal tombs on the hills surrounding Petra. These routes offer stunning panoramic views but require good fitness and sturdy shoes.</p>

        <h2>Practical Tips</h2>
        <ul>
          <li>Wear comfortable walking shoes - you'll cover 4-8km depending on your route</li>
          <li>Bring plenty of water, especially in summer</li>
          <li>Hire a guide for deeper insights into Nabatean history</li>
          <li>Consider a horse or donkey for the initial approach to the Siq</li>
          <li>Visit early morning to avoid crowds and heat</li>
        </ul>

        <h2>Where to Stay Near Petra</h2>
        <p>Petra is located in a valley, so most accommodation is in the nearby town of Wadi Musa. Options range from budget guesthouses to luxury resorts. For the ultimate experience, consider staying in a cave hotel carved into the surrounding hills.</p>

        <div class='bg-amber-50 p-4 rounded-lg my-6'>
          <h3 class='text-amber-800 font-semibold'>Pro Tip</h3>
          <p class='text-amber-700'>Book your Petra tickets online in advance to skip the lines at the entrance. The site can get crowded, especially during peak tourist season.</p>
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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

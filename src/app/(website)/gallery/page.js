import { Image as ImageIcon, Sparkles } from 'lucide-react';

export const metadata = { title: 'Gallery - AdSky Solution' };

const categories = ['All', 'Office', 'Events', 'Team', 'Projects'];
const galleryItems = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
}));

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="deco-blob deco-blob-blue w-[500px] h-[500px] -top-32 -right-32 animate-blob" />
        <div className="deco-blob deco-blob-purple w-[400px] h-[400px] top-1/2 -left-32 animate-blob" style={{ animationDelay: '5s' }} />

        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-5">
            <ImageIcon size={13} />
            <span>Culture &amp; Moments</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Our <span className="gradient-text">Gallery</span>
          </h1>

          <p className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Moments captured from our journey
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding !pt-0 relative overflow-hidden pb-28">
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/15 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 flex items-center justify-center text-5xl font-black gradient-text opacity-25 group-hover:opacity-40 transition-opacity">
                  {item.id}
                </div>
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 backdrop-blur-xs transition-all duration-300 flex items-center justify-center p-4">
                  <span className="text-white text-xs font-bold bg-primary/90 px-4 py-2 rounded-full shadow-lg">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-400 text-xs mt-10">
            Upload real images from the admin dashboard to fill this gallery.
          </p>
        </div>
      </section>
    </>
  );
}

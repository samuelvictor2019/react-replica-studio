import noticeImg from "@/assets/media_notice.jpg";

const MediaNotice = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
          <div>
            <h3 className="font-heading text-3xl md:text-4xl font-medium text-black">Media notice</h3>
            <p className="text-sm text-black/70 mt-4 max-w-md">New media releases and featured videos are highlighted here. Check back often for fresh content.</p>
          </div>

          <div>
            <div className="overflow-hidden rounded-[18px]">
              <img src={noticeImg} alt="Media notice" className="w-full h-40 md:h-48 object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MediaNotice;

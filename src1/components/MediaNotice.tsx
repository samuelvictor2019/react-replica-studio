import noticeImg from "@/assets/media_notice.jpg";

const MediaNotice = () => {
  return (
    <section className="py-20 bg-background">
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex-1 px-4 md:pl-[max(2rem,calc((100vw-64rem)/2+2rem))] md:pr-10">
          <h3 className="font-heading text-[clamp(1.8rem,5vw,2.5rem)] font-medium text-foreground">Media notice</h3>
          <p className="text-sm text-muted-foreground mt-4 max-w-md">New media releases and featured videos are highlighted here. Check back often for fresh content.</p>
        </div>

        <div className="md:w-[45%] overflow-hidden rounded-l-[18px] mt-8 md:mt-0">
          <img src={noticeImg} alt="Media notice" className="w-full h-40 md:h-48 object-cover" />
        </div>
      </div>
    </section>
  );
};

export default MediaNotice;

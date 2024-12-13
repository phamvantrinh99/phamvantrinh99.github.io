using EPiServer.Core;
using EPiServer.DataAnnotations;
using EPiServer.Web;
using System.ComponentModel.DataAnnotations;
using TraditionalMedicalClinic.Business.Constants;

namespace TraditionalMedicalClinic.Cms.Models.Pages
{
    public class TMCBasePage : PageData
    {
        #region SEO

        [Display(
            Name = "Browser Title",
            Description = "Title tag for SEO, most likely what search engines will display in search results.",
            GroupName = GroupNames.SEO,
            Order = 10)]
        [CultureSpecific]
        public virtual string BrowserTitle { get; set; }

        [Display(
            Name = "Keywords",
            Description = "Keywords are ideas and topics that define what your content is about for SEO.",
            GroupName = GroupNames.SEO,
            Order = 20)]
        [CultureSpecific]
        public virtual string Keywords { get; set; }

        [Display(
            Name = "Meta Description",
            Description = "A meta description tag is displayed as part of the search snippet in a search engine results page and is meant to give the user an idea of the content that exists within the page and how it relates to their search query.",
            GroupName = GroupNames.SEO,
            Order = 30)]
        [CultureSpecific]
        [UIHint(UIHint.Textarea)]
        public virtual string MetaDescription { get; set; }

        [Display(
            Name = "Open Graph Image",
            Description = "An open graph image is the image that appears when you post website content to your social accounts. It is part of an important group of meta tags that influence the performance of your content link on social media like Facebook, Linkedin, Pinterest and Twitter.",
            GroupName = GroupNames.SEO,
            Order = 40)]
        [UIHint(UIHint.Image)]
        public virtual ContentReference OpenGraphImage { get; set; }

        [Display(
            Name = "Disable Indexing",
            Description = "Tells search engines not to include this page in search results.",
            GroupName = GroupNames.SEO,
            Order = 50)]
        [CultureSpecific]
        public virtual bool DisableIndexing { get; set; }

        #endregion
    }
}

using EPiServer.Web;
using System.ComponentModel.DataAnnotations;
using static TraditionalMedicalClinic.Globals;

namespace TraditionalMedicalClinic.Models.Pages.TMC
{
    public class TMCBasePage : PageData
    {
        #region MetaData

        [Display(
            Name = "Browser Title",
            Description = "Title tag for MetaData, most likely what search engines will display in search results.",
            GroupName = GroupNames.MetaData,
            Order = 10)]
        [CultureSpecific]
        public virtual string BrowserTitle { get; set; }

        [Display(
            Name = "Keywords",
            Description = "Keywords are ideas and topics that define what your content is about for MetaData.",
            GroupName = GroupNames.MetaData,
            Order = 20)]
        [CultureSpecific]
        public virtual string Keywords { get; set; }

        [Display(
            Name = "Meta Description",
            Description = "A meta description tag is displayed as part of the search snippet in a search engine results page and is meant to give the user an idea of the content that exists within the page and how it relates to their search query.",
            GroupName = GroupNames.MetaData,
            Order = 30)]
        [CultureSpecific]
        [UIHint(UIHint.Textarea)]
        public virtual string MetaDescription { get; set; }

        [Display(
            Name = "Open Graph Image",
            Description = "An open graph image is the image that appears when you post website content to your social accounts. It is part of an important group of meta tags that influence the performance of your content link on social media like Facebook, Linkedin, Pinterest and Twitter.",
            GroupName = GroupNames.MetaData,
            Order = 40)]
        [UIHint(UIHint.Image)]
        public virtual ContentReference OpenGraphImage { get; set; }

        [Display(
            Name = "Disable Indexing",
            Description = "Tells search engines not to include this page in search results.",
            GroupName = GroupNames.MetaData,
            Order = 50)]
        [CultureSpecific]
        public virtual bool DisableIndexing { get; set; }

        #endregion
    }
}
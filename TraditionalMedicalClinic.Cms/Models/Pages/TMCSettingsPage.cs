using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.DataAnnotations;
using EPiServer.SpecializedProperties;
using EPiServer.Web;
using System.ComponentModel.DataAnnotations;
using TraditionalMedicalClinic.Business.Constants;

namespace TraditionalMedicalClinic.Cms.Models.Pages
{
    [ContentType(
        DisplayName = "[TMC] Settings Page",
        GUID = "5b81d503-c725-46d6-80cb-ef9d5b47d391",
        GroupName = GroupNames.Content,
        Description = "Template for the Settings Page")]
    [ImageUrl(PageIconPaths.HomeIcon)]
    public class TMCSettingsPage : PageData
    {
        #region Header
        [Display(
            Name = "Heading",
            Description = "",
            GroupName = GroupNames.Header,
            Order = 10)]
        [CultureSpecific]
        public virtual string Heading { get; set; }

        [Display(
            Name = "Logo",
            Description = "",
            GroupName = GroupNames.Header,
            Order = 20)]
        [UIHint(UIHint.Image)]
        public virtual ContentReference Logo { get; set; }
        #endregion

        #region Site Settings

        [Display(
            Name = "Meta Data within the Head tag",
            Description = "",
            GroupName = GroupNames.SiteSettings,
            Order = 10)]
        [CultureSpecific]
        [UIHint(UIHint.Textarea)]
        public virtual string MetaDataWithinTheHeadTag { get; set; }

        [Display(
            Name = "Scripts within the Head tag",
            Description = "",
            GroupName = GroupNames.SiteSettings,
            Order = 20)]
        [CultureSpecific]
        [UIHint(UIHint.Textarea)]
        public virtual string ScriptsWithinTheHeadTag { get; set; }

        [Display(
            Name = "Scripts after opening Body tag",
            Description = "",
            GroupName = GroupNames.SiteSettings,
            Order = 30)]
        [CultureSpecific]
        [UIHint(UIHint.Textarea)]
        public virtual string ScriptsAfterOpeningBodyTag { get; set; }

        [Display(
            Name = "Scripts before closing Body tag",
            Description = "",
            GroupName = GroupNames.SiteSettings,
            Order = 40)]
        [CultureSpecific]
        [UIHint(UIHint.Textarea)]
        public virtual string ScriptsBeforeClosingBodyTag { get; set; }

        [Display(
            Name = "Frontend Build Version",
            Description = "",
            GroupName = GroupNames.SiteSettings,
            Order = 50)]
        public virtual string FrontendBuildVersion { get; set; }

        #endregion
    }
}

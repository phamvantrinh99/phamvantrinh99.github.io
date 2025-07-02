using System.ComponentModel.DataAnnotations;
using static TraditionalMedicalClinic.Globals;

namespace TraditionalMedicalClinic.Models.Pages.TMC
{
    [ContentType(
        DisplayName = "[TMC] Home Page",
        GUID = "04731ca5-9d0a-4cb8-b310-0fb289a8878c",
        GroupName = GroupNames.Content,
        Description = "Template for the Home Page")]
    [SiteImageUrl]
    public class TMCHomePage : TMCBasePage
    {
        #region Content
        [Display(
            Name = "Heading",
            Description = "",
            GroupName = SystemTabNames.Content,
            Order = 10)]
        public virtual string Heading { get; set; }

        [Display(
            Name = "Main Content Area",
            Description = "",
            GroupName = SystemTabNames.Content,
            Order = 20)]
        public virtual ContentArea MainContentArea { get; set; }

        #endregion

        #region Site Settings
        [Display(
            Name = "Site Settings Page",
            Description = "",
            GroupName = GroupNames.SiteSettings,
            Order = 10)]
        public virtual ContentReference SiteSettingsPage { get; set; }
        #endregion
    }
}
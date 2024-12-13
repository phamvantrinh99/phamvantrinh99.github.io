using System.ComponentModel.DataAnnotations;

namespace TraditionalMedicalClinic.Business.Constants
{
    public static class GroupNames
    {
        [Display(Order = 10)]
        public const string Content = "Content";

        [Display(Order = 20)]
        public const string Header = "Header";

        [Display(Order = 30)]
        public const string SEO = "SEO";

        [Display(Order = 40)]
        public const string SiteSettings = "Site Settings";
    }
}

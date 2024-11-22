// <copyright file="IdentityMetric.codegen.cs" company="Microsoft Corporation">
// Copyright (c) Microsoft Corporation. All rights reserved.
// </copyright>
// <autogenerated />

using System.Collections.Specialized;
using System.Diagnostics.CodeAnalysis;

namespace Microsoft.Azure.IdentitySidecar.Telemetry.Metrics
{
    public class IdentityMetric
    {
        public enum MetricName
        {
            RoleStart,
            RoleStop,
            RestApiStarted,
            RestApiSucceeded,
            RestApiFailed,
        }

        public string Name { get; }

        public long? Value { get; }

        public OrderedDictionary Dimensions { get; }

        public OrderedDictionary Annotations { get; }

        private IdentityMetric(
            MetricName name,
            OrderedDictionary dimensions,
            OrderedDictionary annotations)
        {
            this.Name = $"{name}";
            this.Dimensions = dimensions;
            this.Annotations = annotations;
        }

        private IdentityMetric(
            MetricName name,
            long value,
            OrderedDictionary dimensions,
            OrderedDictionary annotations)
        {
            this.Name = $"{name}";
            this.Value = value;
            this.Dimensions = dimensions;
            this.Annotations = annotations;
        }

        public static Dictionary<string, List<string>> Enumerate()
        {
            var metricsToCreate = new Dictionary<string, List<string>>()
            {
                {
                    "RoleStart",
                    new List<string> {  }
                },
                {
                    "RoleStop",
                    new List<string> {  }
                },
                {
                    "RestApiStarted",
                    new List<string> { "Name", "HttpMethod", "ApiVersion" }
                },
                {
                    "RestApiSucceeded",
                    new List<string> { "Name", "HttpMethod", "ApiVersion" }
                },
                {
                    "RestApiFailed",
                    new List<string> { "Name", "ErrorCode", "HttpMethod", "ApiVersion" }
                },
            };

            return metricsToCreate;
        }

        public static IdentityMetric RoleStart()
        {
            OrderedDictionary annotationsDict = new OrderedDictionary();

            OrderedDictionary dimensions = new OrderedDictionary();

            return new IdentityMetric(
                MetricName.RoleStart,
                dimensions,
                annotationsDict);
        }

        public static IdentityMetric RoleStop()
        {
            OrderedDictionary annotationsDict = new OrderedDictionary();

            OrderedDictionary dimensions = new OrderedDictionary();

            return new IdentityMetric(
                MetricName.RoleStop,
                dimensions,
                annotationsDict);
        }

        public static IdentityMetric RestApiStarted(string name, string httpMethod, string apiVersion, string webContext)
        {
            OrderedDictionary annotationsDict = new OrderedDictionary();
            annotationsDict.Add("webContext", webContext);

            OrderedDictionary dimensions = new OrderedDictionary();
            dimensions.Add("Name", name);
            dimensions.Add("HttpMethod", httpMethod);
            dimensions.Add("ApiVersion", apiVersion);

            return new IdentityMetric(
                MetricName.RestApiStarted,
                dimensions,
                annotationsDict);
        }

        public static IdentityMetric RestApiSucceeded(long logValue, string name, string httpMethod, string apiVersion, string url)
        {
            OrderedDictionary annotationsDict = new OrderedDictionary();
            annotationsDict.Add("Url", url);

            OrderedDictionary dimensions = new OrderedDictionary();
            dimensions.Add("Name", name);
            dimensions.Add("HttpMethod", httpMethod);
            dimensions.Add("ApiVersion", apiVersion);

            return new IdentityMetric(
                MetricName.RestApiSucceeded,
                logValue,
                dimensions,
                annotationsDict);
        }

        public static IdentityMetric RestApiFailed(long logValue, string name, string errorCode, string httpMethod, string apiVersion, string url)
        {
            OrderedDictionary annotationsDict = new OrderedDictionary();
            annotationsDict.Add("Url", url);

            OrderedDictionary dimensions = new OrderedDictionary();
            dimensions.Add("Name", name);
            dimensions.Add("ErrorCode", errorCode);
            dimensions.Add("HttpMethod", httpMethod);
            dimensions.Add("ApiVersion", apiVersion);

            return new IdentityMetric(
                MetricName.RestApiFailed,
                logValue,
                dimensions,
                annotationsDict);
        }

        public class Annotation
        {
            [SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Suppress OACR error.")]
            public class RestApiStarted
            {
                public RestApiStarted(string webContext)
                {
                    this.webContext = webContext;
                }

                public string webContext { get; set; }
            }
            [SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Suppress OACR error.")]
            public class RestApiSucceeded
            {
                public RestApiSucceeded(string Url)
                {
                    this.Url = Url;
                }

                public string Url { get; set; }
            }
            [SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Suppress OACR error.")]
            public class RestApiFailed
            {
                public RestApiFailed(string Url)
                {
                    this.Url = Url;
                }

                public string Url { get; set; }
            }
        }

        public class Dimension
        {
            [SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Suppress OACR error.")]
            public static class RestApiStarted
            {
                public static readonly string Name = "Name";
                public static readonly string HttpMethod = "HttpMethod";
                public static readonly string ApiVersion = "ApiVersion";
            }
            [SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Suppress OACR error.")]
            public static class RestApiSucceeded
            {
                public static readonly string Name = "Name";
                public static readonly string HttpMethod = "HttpMethod";
                public static readonly string ApiVersion = "ApiVersion";
            }
            [SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Suppress OACR error.")]
            public static class RestApiFailed
            {
                public static readonly string Name = "Name";
                public static readonly string ErrorCode = "ErrorCode";
                public static readonly string HttpMethod = "HttpMethod";
                public static readonly string ApiVersion = "ApiVersion";
            }
        }
    }
}